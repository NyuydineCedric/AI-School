import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getGrades } from "../lib/api";

interface GradeRow {
  course: string;
  grade: string;
  score: string;
  credits: number;
}
interface GradesResponse {
  rows: GradeRow[];
  overall_gpa: number;
  total_courses: number;
  total_credits: number;
}

const gradeColor: Record<string, string> = {
  A: "text-emerald-600",
  "A-": "text-emerald-600",
  "B+": "text-indigo-600",
  B: "text-amber-600",
};

const GradesPage: React.FC = () => {
  const [data, setData] = useState<GradesResponse | null>(null);

  useEffect(() => {
    getGrades()
      .then(setData)
      .catch(() =>
        setData({
          rows: [],
          overall_gpa: 0,
          total_courses: 0,
          total_credits: 0,
        }),
      );
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="grades" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">My Grades</h1>

        {data && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Overall GPA</p>
              <p className="text-2xl font-semibold text-indigo-600 mt-1">
                {data.overall_gpa}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Courses</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">
                {data.total_courses}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Credits</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">
                {data.total_credits}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Grade</th>
                <th className="text-left font-medium px-5 py-3">Score</th>
                <th className="text-left font-medium px-5 py-3">Credits</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((r) => (
                <tr key={r.course} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{r.course}</td>
                  <td
                    className={`px-5 py-3 font-semibold ${gradeColor[r.grade] ?? "text-slate-700"}`}
                  >
                    {r.grade}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.score}</td>
                  <td className="px-5 py-3 text-slate-600">{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default GradesPage;
