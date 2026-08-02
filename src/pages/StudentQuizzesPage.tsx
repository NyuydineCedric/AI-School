import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { AlertCircle, HelpCircle } from "lucide-react";
import { getQuizzes } from "../lib/api";

interface Quiz {
  id: string;
  title: string;
  course?: string;
  duration_minutes: number;
  questions: number;
}

const StudentQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getQuizzes()
      .then(setQuizzes)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load quizzes."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Quizzes</h1>

        {loading && <p className="text-sm text-slate-400">Loading quizzes…</p>}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Duration</th>
                <th className="text-left font-medium px-5 py-3">Questions</th>
                <th className="text-left font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!loading && quizzes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    Nothing here yet — your teacher hasn't published a quiz.
                  </td>
                </tr>
              )}
              {quizzes.map((q) => (
                <tr key={q.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} className="text-amber-500" />
                      {q.title}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {q.course ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {q.duration_minutes} mins
                  </td>
                  <td className="px-5 py-3 text-slate-600">{q.questions}</td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/student/quizzes/${q.id}`}
                      className="text-sm text-indigo-600 font-medium"
                    >
                      Start
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentQuizzesPage;
