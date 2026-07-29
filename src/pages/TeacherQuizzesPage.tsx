import React from "react";
import Sidebar from "../components/Sidebar";
import { Plus } from "lucide-react";

const quizzes = [
  {
    title: "Operating Systems Quiz",
    course: "Operating Systems",
    questions: 10,
    avgScore: "78%",
  },
  {
    title: "Database Basics Quiz",
    course: "Database Systems",
    questions: 8,
    avgScore: "82%",
  },
];

const TeacherQuizzesPage: React.FC = () => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar role="teacher" active="quizzes" />
    <main className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-slate-800">Quizzes</h1>
        <button className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={14} /> Create Quiz
        </button>
      </div>
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
              <tr key={q.title} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-700">{q.title}</td>
                <td className="px-5 py-3 text-slate-600">{q.course}</td>
                <td className="px-5 py-3 text-slate-600">{q.questions}</td>
                <td className="px-5 py-3 font-semibold text-emerald-600">
                  {q.avgScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  </div>
);

export default TeacherQuizzesPage;
