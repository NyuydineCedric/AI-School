import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import StatCard from "../components/StatCard";
import { Link } from "react-router-dom";
import { getTeacherDashboard } from "../lib/api";
import { Role } from "../types";

import { getName } from "../lib/auth";

const TeacherDashboard: React.FC<{ role: Role }> = ({ role }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getTeacherDashboard()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <TopHeader
          greeting={`Welcome back, ${getName() ?? "there"}!`}
          subtitle="Here's an overview of your classes."
          avatarInitial={(getName() ?? "T").charAt(0)}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Students" value={data?.student_count ?? 0} />
          <StatCard
            label="Assignments Pending"
            value={data?.assignments_pending ?? 0}
            accent="text-amber-600"
          />
          <StatCard
            label="Average Score"
            value={data?.avg_score ?? "0%"}
            accent="text-emerald-600"
          />
          <StatCard
            label="Upcoming Exams"
            value={data?.upcoming_exams ?? 0}
            accent="text-rose-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Recent Activities
            </h3>
            <div className="space-y-3">
              {(data?.recent_activities ?? []).map((a: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <p className="text-sm text-slate-600">{a}</p>
                </div>
              ))}
              {(!data || data.recent_activities.length === 0) && (
                <p className="text-sm text-slate-400">No recent activity.</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Top Performing Students
            </h3>
            <div className="space-y-3">
              {(data?.top_students ?? []).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700">{s.name}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {s.score}
                  </span>
                </div>
              ))}
              {(!data || data.top_students.length === 0) && (
                <p className="text-sm text-slate-400">
                  No grades recorded yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
