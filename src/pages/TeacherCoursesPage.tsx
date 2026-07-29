import React from "react";
import Sidebar from "../components/Sidebar";

const courses = [
  { name: "Data Structures", students: 62, avg: "82%", color: "bg-indigo-100" },
  {
    name: "Operating Systems",
    students: 58,
    avg: "76%",
    color: "bg-emerald-100",
  },
  { name: "Database Systems", students: 71, avg: "80%", color: "bg-rose-100" },
];

const TeacherCoursesPage: React.FC = () => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar role="teacher" active="courses" />
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-slate-800 mb-5">My Courses</h1>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((c) => (
          <div
            key={c.name}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden"
          >
            <div className={`h-16 ${c.color}`} />
            <div className="p-4">
              <p className="font-semibold text-slate-800 text-sm mb-2">
                {c.name}
              </p>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{c.students} students</span>
                <span className="font-medium text-emerald-600">
                  {c.avg} avg
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  </div>
);

export default TeacherCoursesPage;
