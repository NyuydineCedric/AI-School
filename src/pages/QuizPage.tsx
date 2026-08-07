import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertCircle, Clock } from "lucide-react";
import { getQuiz, submitQuiz } from "../lib/api";

interface Question {
  id: string;
  text: string;
  marks: number;
  options: Record<string, string>;
}
interface Quiz {
  id: string;
  title: string;
  duration_minutes: number;
  questions: Question[];
}

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score_pct: number;
    earned: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Countdown state, in whole seconds remaining. null until the quiz (and
  // therefore duration_minutes) has loaded.
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  // Guards against double-submitting: the interval could tick to 0 more
  // than once before handleSubmit's async call resolves and unmounts things.
  const autoSubmittedRef = useRef(false);
  // Keep the latest handleSubmit/answers/quiz accessible inside the
  // interval callback without having to recreate the interval every time
  // answers change (which would reset the countdown).
  const submitRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!id) {
      setError("No quiz selected.");
      return;
    }
    getQuiz(id)
      .then((q: Quiz) => {
        setQuiz(q);
        setSecondsLeft(q.duration_minutes * 60);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load quiz."),
      );
  }, [id]);

  const question = quiz?.questions[current];

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const res = await submitQuiz(quiz.id, answers);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    }
  };

  // Always call the latest handleSubmit from the timer, without restarting
  // the countdown interval whenever `answers` (and therefore handleSubmit)
  // changes identity.
  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  // The countdown itself. Ticks once a second once the quiz has loaded,
  // and stops once the quiz has been submitted (result is set) or time
  // runs out.
  useEffect(() => {
    if (secondsLeft === null || result) return;

    if (secondsLeft <= 0) {
      if (!autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        submitRef.current();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setSecondsLeft((s) => (s === null ? null : s - 1));
    }, 1000);

    return () => clearTimeout(timerId);
  }, [secondsLeft, result]);

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="quizzes" />
        <main className="flex-1 p-6 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={15} /> {error}
        </main>
      </div>
    );
  }

  if (!quiz || !question) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="quizzes" />
        <main className="flex-1 p-6 text-sm text-slate-400">Loading quiz…</main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="quizzes" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500 mb-1">
              {autoSubmittedRef.current
                ? "Time's up — quiz submitted automatically"
                : "Quiz submitted"}
            </p>
            <p className="text-3xl font-bold text-indigo-600">
              {result.score_pct}%
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {result.earned} / {result.total} marks
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Under a minute left: flag it visually so the student notices time is
  // almost up.
  const isLowTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-slate-800">{quiz.title}</h1>
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

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Questions
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={`w-8 h-8 rounded-md text-xs font-medium flex items-center justify-center ${
                    i === current
                      ? "bg-indigo-600 text-white"
                      : answers[q.id]
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-50 text-slate-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              Question {current + 1} ({question.marks} marks)
            </h3>
            <p className="text-sm text-slate-700 mb-6">{question.text}</p>

            <div className="space-y-3 flex-1">
              {Object.entries(question.options).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [question.id]: key }))
                  }
                  className={`w-full flex items-center gap-3 border rounded-lg px-4 py-3 text-sm text-left ${
                    answers[question.id] === key
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                      answers[question.id] === key
                        ? "border-indigo-500 bg-indigo-500 text-white"
                        : "border-slate-300"
                    }`}
                  >
                    {key}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="flex items-center gap-1 text-sm text-slate-500 font-medium disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              {current === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() =>
                    setCurrent((c) =>
                      Math.min(quiz.questions.length - 1, c + 1),
                    )
                  }
                  className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  Next <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
