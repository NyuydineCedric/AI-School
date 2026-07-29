import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search } from 'lucide-react';
import { Course } from '../types';

const courses: Course[] = [
  { id: '1', name: 'Data Structures', instructor: 'Dr. Smith', progress: 75, color: 'bg-indigo-100' },
  { id: '2', name: 'Operating Systems', instructor: 'Dr. Johnson', progress: 60, color: 'bg-emerald-100' },
  { id: '3', name: 'Database Systems', instructor: 'Dr. Williams', progress: 60, color: 'bg-rose-100' },
  { id: '4', name: 'Computer Networks', instructor: 'Dr. Brown', progress: 80, color: 'bg-amber-100' },
  { id: '5', name: 'Machine Learning', instructor: 'Dr. Davis', progress: 55, color: 'bg-pink-100' },
  { id: '6', name: 'Web Development', instructor: 'Prof. Lee', progress: 70, color: 'bg-cyan-100' },
];

const tabs = [
  { key: 'all', label: 'All (8)' },
  { key: 'enrolled', label: 'Enrolled (6)' },
  { key: 'completed', label: 'Completed (2)' },
];

const CoursesPage: React.FC = () => {
  const [tab, setTab] = useState('all');

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="courses" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-slate-800">My Courses</h1>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              placeholder="Search courses..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-56"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className={`h-20 ${c.color}`} />
              <div className="p-4">
                <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                <p className="text-xs text-slate-400 mb-3">{c.instructor}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div
                    className="h-1.5 bg-indigo-500 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
