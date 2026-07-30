import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getStudents } from "../lib/api";

interface StudentRow {
  id: string;
  name: string;
  attendance: string;
  grade: string;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentRow[]>([]);

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="students" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Students</h1>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Student</th>
                <th className="text-left font-medium px-5 py-3">Attendance</th>
                <th className="text-left font-medium px-5 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{s.name}</td>
                  <td className="px-5 py-3 text-slate-600">{s.attendance}</td>
                  <td className="px-5 py-3 font-semibold text-indigo-600">
                    {s.grade}
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

export default StudentsPage;
