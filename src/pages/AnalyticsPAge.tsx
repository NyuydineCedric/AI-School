import React from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const scores = [55, 62, 58, 70, 66, 78];
const points = scores
  .map((s, i) => `${(i / (scores.length - 1)) * 260},${90 - (s / 100) * 80}`)
  .join(" ");

const AnalyticsPage: React.FC = () => (
  <div className="flex h-screen bg-slate-50">
    <Sidebar role="teacher" active="analytics" />
    <main className="flex-1 overflow-y-auto p-6">
      <h1 className="text-xl font-semibold text-slate-800 mb-5">Analytics</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Avg Class Score"
          value="78%"
          accent="text-emerald-600"
        />
        <StatCard label="Completion Rate" value="82%" />
        <StatCard label="At-Risk Students" value={4} accent="text-rose-600" />
        <StatCard label="Active Courses" value={3} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">
          Average Score Trend
        </h3>
        <svg viewBox="0 0 260 100" className="w-full h-40">
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
      </div>
    </main>
  </div>
);

export default AnalyticsPage;
