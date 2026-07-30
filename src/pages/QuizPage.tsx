import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { getQuizzes, getQuiz, submitQuiz } from "../lib/api";

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

const QuizPage: React.FC = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score_pct: number;
    earned: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuizzes()
      .then(async (list) => {
        if (!list[0]) return setError("No quizzes assigned yet.");
        const full = await getQuiz(list[0].id);
        setQuiz(full);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load quiz."),
      );
  }, []);

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
            <p className="text-sm text-slate-500 mb-1">Quiz submitted</p>
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

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-5">
          {quiz.title}
        </h1>

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
