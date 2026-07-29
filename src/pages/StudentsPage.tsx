import React from "react";
import Sidebar from "../components/Sidebar";

const students = [
  {
    name: "Alex Morgan",
    course: "Data Structures",
    attendance: "96%",
    grade: "A",
  },
  {
    name: "Samantha Lee",
    course: "Data Structures",
    attendance: "93%",
    grade: "A-",
  },
  {
    name: "Daniel Kim",
    course: "Operating Systems",
    attendance: "88%",
    grade: "B+",
  },
  {
    name: "Cedric N.",
    course: "Database Systems",
    attendance: "92%",
    grade: "B+",
  },
];

const StudentsPage: React.FC = () => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar role="teacher" active="students" />
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-slate-800 mb-5">Students</h1>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs">
              <th className="text-left font-medium px-5 py-3">Student</th>
              <th className="text-left font-medium px-5 py-3">Course</th>
              <th className="text-left font-medium px-5 py-3">Attendance</th>
              <th className="text-left font-medium px-5 py-3">Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name} className="border-t border-slate-100">
                <td className="px-5 py-3 text-slate-700">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.course}</td>
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

export default StudentsPage;
