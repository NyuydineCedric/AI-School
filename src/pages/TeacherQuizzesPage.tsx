import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getQuizzes } from "../lib/api";

interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  avg_score: string | null;
}

const TeacherQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    getQuizzes()
      .then(setQuizzes)
      .catch(() => setQuizzes([]));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Quizzes</h1>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Questions</th>
                <th className="text-left font-medium px-5 py-3">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{q.title}</td>
                  <td className="px-5 py-3 text-slate-600">{q.course}</td>
                  <td className="px-5 py-3 text-slate-600">{q.questions}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">
                    {q.avg_score ?? "-"}
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

export default TeacherQuizzesPage;
