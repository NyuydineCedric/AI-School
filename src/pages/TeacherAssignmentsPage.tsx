import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAssignments } from "../lib/api";

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  max_marks: number;
}

const TeacherAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    getAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Assignments
        </h1>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Due</th>
                <th className="text-left font-medium px-5 py-3">Max Marks</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{a.title}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {a.due_date
                      ? new Date(a.due_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{a.max_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TeacherAssignmentsPage;
