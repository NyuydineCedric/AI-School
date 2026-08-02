import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { createCourse, getCourses } from "../lib/api";

interface Course {
  id: string;
  name: string;
  color: string;
  students: number;
  avg: string;
}

const TeacherCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("bg-indigo-100");

  const loadCourses = () => {
    getCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const created = await createCourse(name.trim(), color);
    setCourses((prev) => [created, ...prev]);
    setName("");
    setColor("bg-indigo-100");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="courses" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          My Courses
        </h1>
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New course name"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="bg-indigo-100">Indigo</option>
              <option value="bg-emerald-100">Emerald</option>
              <option value="bg-rose-100">Rose</option>
              <option value="bg-amber-100">Amber</option>
            </select>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Create Course
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              to={`/teacher/courses/${c.id}`}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
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
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TeacherCoursesPage;
