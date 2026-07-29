import React from "react";
import Sidebar from "../components/Sidebar";
import { Plus } from "lucide-react";

const assignments = [
  {
    title: "Data Structures Assignment",
    course: "Data Structures",
    due: "24 May 2026",
    submissions: "48 / 62",
  },
  {
    title: "OS Scheduling Report",
    course: "Operating Systems",
    due: "28 May 2026",
    submissions: "30 / 58",
  },
];

const TeacherAssignmentsPage: React.FC = () => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar role="teacher" active="assignments" />
    <main className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-slate-800">Assignments</h1>
        <button className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus size={14} /> Create Assignment
        </button>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-left font-medium px-5 py-3">Title</th>
              <th className="text-left font-medium px-5 py-3">Course</th>
              <th className="text-left font-medium px-5 py-3">Due</th>
              <th className="text-left font-medium px-5 py-3">Submissions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.title} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-700">{a.title}</td>
                <td className="px-5 py-3 text-slate-600">{a.course}</td>
                <td className="px-5 py-3 text-slate-600">{a.due}</td>
                <td className="px-5 py-3 text-slate-600">{a.submissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  </div>
);

export default TeacherAssignmentsPage;
