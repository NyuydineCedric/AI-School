import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useParams } from "react-router-dom";
import { AlertCircle, Clock, FileText, Lock } from "lucide-react";
import { getExam, submitExam } from "../lib/api";
import { getToken } from "../lib/auth";

interface Exam {
  id: string;
  title: string;
  instructions: string;
  duration_minutes: number;
  submitted?: boolean;
  submitted_at?: string | null;
}

// Same base-URL resolution as lib/api.ts, needed here separately because
// the beforeunload/pagehide handler below has to fire a raw fetch (not
// go through apiPost) to reliably run during page teardown.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const ExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [lockedFromServer, setLockedFromServer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Guards so the exam only ever gets finalized once, no matter which of
  // the several triggers (timer, explicit button, route-away, tab close)
  // fires it. Refs (not state) because these are read inside event
  // handlers and interval callbacks that shouldn't be recreated whenever
  // state changes.
  const hasSubmittedRef = useRef(false);
  const lockedRef = useRef(false);
  const answerRef = useRef(answer);
  const examRef = useRef(exam);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    examRef.current = exam;
  }, [exam]);

  useEffect(() => {
    if (!id) {
      setError("No exam selected.");
      return;
    }
    getExam(id)
      .then((e: Exam) => {
        setExam(e);
        if (e.submitted) {
          // Already submitted in a previous visit — lock immediately,
          // never start the timer, never show the answer box. This is
          // what actually prevents re-entry (refresh, back button, or
          // coming back later all hit this same check).
          setLockedFromServer(true);
          lockedRef.current = true;
          hasSubmittedRef.current = true;
        } else {
          setSecondsLeft(e.duration_minutes * 60);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load exam."),
      );
  }, [id]);

  // Finalizes the exam through the normal in-app API client. Used for the
  // explicit Submit button and the countdown-expiry case, where the page
  // stays open and a normal fetch is fine.
  const finalizeExam = async () => {
    if (!exam || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    try {
      await submitExam(exam.id, answerRef.current);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    }
  };

  // Finalizes the exam via a raw fetch with keepalive, for use in
  // beforeunload/pagehide handlers. Browsers can kill in-flight requests
  // the instant a tab closes, so `keepalive: true` asks the browser to
  // let this specific request finish in the background even after the
  // page is gone. This is best-effort — no browser API can *guarantee*
  // delivery on tab close, which is a fundamental JS limitation, not
  // something fixable from application code. The real enforcement is the
  // server-side "submitted" lock checked on every page load: even if this
  // particular request is lost, the student still can't resume once
  // they've submitted through any other path (timer, button, or
  // navigating away in-app, which uses a normal non-teardown request and
  // is much more reliable).
  const finalizeExamOnUnload = () => {
    if (!examRef.current || hasSubmittedRef.current || lockedRef.current)
      return;
    hasSubmittedRef.current = true;
    const token = getToken();
    fetch(`${API_BASE_URL}/exams/${examRef.current.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ answer_text: answerRef.current }),
      keepalive: true,
    }).catch(() => {
      // Nothing we can do here — the page is closing. The server-side
      // lock check on next load is the real backstop.
    });
  };

  // Covers actual browser-level exits: closing the tab, refreshing, or
  // typing a new URL. pagehide is the more reliable of the two on mobile
  // Safari; beforeunload covers desktop browsers that don't fire pagehide
  // consistently. Registering both is standard practice for this case.
  useEffect(() => {
    window.addEventListener("beforeunload", finalizeExamOnUnload);
    window.addEventListener("pagehide", finalizeExamOnUnload);
    return () => {
      window.removeEventListener("beforeunload", finalizeExamOnUnload);
      window.removeEventListener("pagehide", finalizeExamOnUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Covers leaving the page WITHOUT closing the browser — e.g. clicking a
  // Sidebar link to go to Dashboard/Messages/etc. React Router unmounts
  // this component in that case, and since the page itself isn't
  // tearing down, a completely normal (non-keepalive) request reliably
  // completes. This is the most common "leave the exam" case and the
  // most trustworthy of the three triggers.
  useEffect(() => {
    return () => {
      if (!hasSubmittedRef.current && examRef.current && !lockedRef.current) {
        hasSubmittedRef.current = true;
        submitExam(examRef.current.id, answerRef.current).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The countdown itself.
  useEffect(() => {
    if (secondsLeft === null || submitted || lockedFromServer) return;

    if (secondsLeft <= 0) {
      if (!hasSubmittedRef.current) {
        setAutoSubmitted(true);
        finalizeExam();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setSecondsLeft((s) => (s === null ? null : s - 1));
    }, 1000);

    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, submitted, lockedFromServer]);

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={15} /> {error}
        </main>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 text-sm text-slate-400">Loading exam…</main>
      </div>
    );
  }

  if (lockedFromServer) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-sm">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Lock size={18} className="text-slate-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-1">
              This exam has already been submitted
            </p>
            <p className="text-sm text-slate-500">
              It can't be retaken or reopened. Your teacher will grade it and
              share your results.
            </p>
            {exam.submitted_at && (
              <p className="text-xs text-slate-400 mt-3">
                Submitted {new Date(exam.submitted_at).toLocaleString()}
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500 mb-1">
              {autoSubmitted
                ? "Time's up — exam submitted automatically"
                : "Exam submitted"}
            </p>
            <p className="text-lg font-semibold text-slate-800 mt-2">
              Your answer has been sent for grading
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Your teacher will review and score it soon.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const isLowTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="exams" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-slate-800">{exam.title}</h1>
          {secondsLeft !== null && (
            <div
              className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg ${
                isLowTime
                  ? "bg-rose-50 text-rose-600 animate-pulse"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Clock size={15} />
              {formatCountdown(secondsLeft)}
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-4 flex items-center gap-2">
          <AlertCircle size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            Leaving this page — closing the tab, refreshing, or navigating
            elsewhere — will submit your answer as-is. You won't be able to
            return to this exam afterward.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText size={14} className="text-rose-500" />
              Exam Details
            </h3>
            <div className="space-y-3 text-xs text-slate-500">
              <div>
                <p className="text-slate-400">Duration</p>
                <p className="text-slate-700 font-medium">
                  {exam.duration_minutes} mins
                </p>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Status</p>
                <p
                  className={`font-medium ${
                    answer.trim() ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {answer.trim() ? "Answer in progress" : "Not started"}
                </p>
              </div>
            </div>
          </div>

          <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-indigo-700 mb-2">
                Exam Instructions
              </p>
              <p className="text-xs text-indigo-600 whitespace-pre-wrap">
                {exam.instructions}
              </p>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-64 border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none flex-1"
            />

            <div className="flex items-center justify-between mt-6">
              <p className="text-xs text-slate-400">
                {saved ? "Draft saved ✓" : ""}
              </p>
              <button
                onClick={finalizeExam}
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
