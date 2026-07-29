import React from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import StatCard from '../components/StatCard';
import { ClipboardList, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const upcoming = [
  { id: '1', title: 'Data Structures Assignment', tag: 'Assignment', due: 'Due in 2 days', icon: ClipboardList, tagColor: 'bg-indigo-50 text-indigo-600' },
  { id: '2', title: 'Operating Systems Quiz', tag: 'Quiz', due: 'Today 2:00 PM', icon: HelpCircle, tagColor: 'bg-amber-50 text-amber-600' },
  { id: '3', title: 'Database Systems Exam', tag: 'Exam', due: 'Tomorrow 9:00 AM', icon: FileText, tagColor: 'bg-rose-50 text-rose-600' },
];

const activities = [
  'Dr. Smith uploaded Database Assignment — 2h ago',
  'AI graded your Quiz - Operating Systems — 5h ago',
  'Exam scheduled for Database Systems — 1d ago',
];

const StudentDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <TopHeader
          greeting="Welcome back, Cedric! 👋"
          subtitle="Here's what's happening today."
          avatarInitial="C"
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Assignments Due" value={3} />
          <StatCard label="Quiz Today" value={1} accent="text-amber-600" />
          <StatCard label="Exams Upcoming" value={2} accent="text-rose-600" />
          <StatCard label="Unread Messages" value={4} accent="text-indigo-600" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-sm">Upcoming</h3>
              <button className="text-xs text-slate-400">•••</button>
            </div>
            <div className="space-y-3">
              {upcoming.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                      <u.icon size={16} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.title}</p>
                      <p className="text-xs text-slate-400">{u.due}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-1 rounded-md ${u.tagColor}`}>
                    {u.tag}
                  </span>
                </div>
              ))}
            </div>
            <button className="text-xs text-indigo-600 font-medium mt-4 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center">
            <h3 className="font-semibold text-slate-800 text-sm self-start mb-4">Overall Performance</h3>
            <div className="relative w-24 h-24 flex items-center justify-center">
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
                  strokeDasharray="85, 100"
                />
              </svg>
              <span className="absolute text-lg font-bold text-slate-800">B+</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 mt-3">3.45 GPA</p>
            <p className="text-xs text-slate-400 mt-1 text-center">Good job! Keep it up.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-sm text-slate-600">{a}</p>
                </div>
              ))}
            </div>
            <button className="text-xs text-indigo-600 font-medium mt-4">View all activities</button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
            <h3 className="font-semibold text-slate-800 text-sm self-start mb-4">Attendance</h3>
            <p className="text-3xl font-bold text-emerald-600">92%</p>
            <p className="text-xs text-slate-400 mt-1">This Month</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
