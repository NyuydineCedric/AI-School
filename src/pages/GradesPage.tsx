import React from 'react';
import Sidebar from '../components/Sidebar';
import { Download } from 'lucide-react';
import { GradeRow } from '../types';

const rows: GradeRow[] = [
  { course: 'Data Structures', grade: 'A', score: '88%', credits: 3 },
  { course: 'Operating Systems', grade: 'B+', score: '78%', credits: 3 },
  { course: 'Database Systems', grade: 'A-', score: '85%', credits: 3 },
  { course: 'Computer Networks', grade: 'B', score: '72%', credits: 3 },
  { course: 'Machine Learning', grade: 'B+', score: '79%', credits: 3 },
];

const gradeColor: Record<string, string> = {
  A: 'text-emerald-600',
  'A-': 'text-emerald-600',
  'B+': 'text-indigo-600',
  B: 'text-amber-600',
};

const GradesPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="grades" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">My Grades</h1>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Overall GPA</p>
            <p className="text-2xl font-semibold text-indigo-600 mt-1">3.45</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Courses</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">6</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Total Credits</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">18</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Class Rank</p>
            <p className="text-2xl font-semibold text-slate-800 mt-1">
              12 <span className="text-sm text-slate-400">/60</span>
            </p>
          </div>
        </div>

        <div className="flex gap-5 mb-4 text-sm font-medium">
          <button className="text-indigo-600 border-b-2 border-indigo-600 pb-1">Grades Overview</button>
          <button className="text-slate-400 pb-1">Learning Insights</button>
        </div>

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
              {rows.map((r) => (
                <tr key={r.course} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{r.course}</td>
                  <td className={`px-5 py-3 font-semibold ${gradeColor[r.grade] ?? 'text-slate-700'}`}>
                    {r.grade}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.score}</td>
                  <td className="px-5 py-3 text-slate-600">{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className="flex items-center gap-1 text-indigo-600 text-sm font-medium mt-4">
          <Download size={14} /> Download Transcript
        </button>
      </main>
    </div>
  );
};

export default GradesPage;
