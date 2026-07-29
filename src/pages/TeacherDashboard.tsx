import React from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import StatCard from '../components/StatCard';

const activities = [
  'Uploaded Data Structures Assignment — 2h ago',
  'AI graded 15 assignments — 4h ago',
  'Database Systems Quiz scheduled — 1d ago',
];

const topStudents = [
  { rank: 1, name: 'Alex Morgan', score: '95%' },
  { rank: 2, name: 'Samantha Lee', score: '93%' },
  { rank: 3, name: 'Daniel Kim', score: '90%' },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const scores = [55, 62, 58, 70, 66, 78];

const points = scores
  .map((s, i) => `${(i / (scores.length - 1)) * 260},${90 - (s / 100) * 80}`)
  .join(' ');

const TeacherDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <TopHeader
          greeting="Welcome back, Dr. Smith! 👋"
          subtitle="Here's an overview of your classes."
          avatarInitial="S"
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Students" value={320} />
          <StatCard label="Assignments Pending" value={12} accent="text-amber-600" />
          <StatCard label="Average Score" value="78%" accent="text-emerald-600" />
          <StatCard label="Upcoming Exams" value={3} accent="text-rose-600" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Class Performance Overview</h3>
            <svg viewBox="0 0 260 100" className="w-full h-32">
              <polyline
                points={points}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {scores.map((s, i) => (
                <circle
                  key={i}
                  cx={(i / (scores.length - 1)) * 260}
                  cy={90 - (s / 100) * 80}
                  r="3"
                  fill="#4f46e5"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">— Average Score (%)</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-slate-800 self-start mb-4">
              Submission Rate (Assignments)
            </h3>
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeDasharray="82, 100"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-800">
                82%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-sm text-slate-600">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Performing Students</h3>
            <div className="space-y-3">
              {topStudents.map((s) => (
                <div key={s.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center">
                      {s.rank}
                    </span>
                    <p className="text-sm text-slate-700">{s.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
