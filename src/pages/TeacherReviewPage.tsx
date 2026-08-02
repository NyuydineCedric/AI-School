import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useLocation } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import {
  getAssignmentSubmissions,
  markAssignmentSubmission,
  getQuizAttempts,
  scoreQuizAttempt,
  getExamAnswers,
  markExamAnswer,
} from "../lib/api";

const TeacherReviewPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "assignments";
  const id = params.get("id") || "";

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (type === "assignments") {
          setItems(await getAssignmentSubmissions(id));
        } else if (type === "quizzes") {
          setItems(await getQuizAttempts(id));
        } else if (type === "exams") {
          setItems(await getExamAnswers(id));
        }
      } catch (err) {
        setItems([]);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load submissions for this item.",
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
    else {
      setLoading(false);
      setError("No assignment/quiz/exam selected.");
    }
  }, [id, type]);

  const saveMark = async (item: any) => {
    if (type === "assignments") {
      await markAssignmentSubmission(
        id,
        item.id,
        score || item.score || "-",
        feedback || item.feedback || "",
      );
    } else if (type === "quizzes") {
      await scoreQuizAttempt(id, item.id, Number(score || item.score || 0));
    } else if (type === "exams") {
      await markExamAnswer(
        id,
        item.id,
        score || item.score || "-",
        feedback || item.feedback || "",
      );
    }
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              score: score || item.score || "-",
              feedback: feedback || item.feedback || "",
            }
          : entry,
      ),
    );
    setActiveId(null);
    setScore("");
    setFeedback("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Review submissions
        </h1>
        {loading ? <p className="text-sm text-slate-400">Loading…</p> : null}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.student_name || "Student"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {type === "assignments"
                      ? item.status
                      : item.submitted
                        ? "Submitted"
                        : "Pending"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="text-sm font-semibold text-indigo-600">
                    {item.score ?? "-"}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-600 whitespace-pre-wrap">
                {type === "assignments" && item.content}
                {type === "quizzes" && item.answers_json}
                {type === "exams" && item.answer_text}
              </div>
              {activeId === item.id ? (
                <div className="mt-4 space-y-2">
                  <input
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="Enter score"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Feedback"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-20"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveMark(item)}
                      className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setActiveId(null);
                        setScore("");
                        setFeedback("");
                      }}
                      className="text-sm text-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveId(item.id);
                    setScore(item.score ?? "");
                    setFeedback(item.feedback ?? "");
                  }}
                  className="mt-4 text-sm text-indigo-600 font-medium"
                >
                  Mark / Review
                </button>
              )}
            </div>
          ))}
          {!loading && !error && items.length === 0 ? (
            <p className="text-sm text-slate-400">No submissions yet.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default TeacherReviewPage;
