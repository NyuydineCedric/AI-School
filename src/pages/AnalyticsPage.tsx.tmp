import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { getAnalytics } from "../lib/api";

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<{
    avg_class_score: string;
    at_risk_students: number;
    active_courses: number;
  } | null>(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="analytics" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Analytics</h1>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Avg Class Score"
            value={data?.avg_class_score ?? "-"}
            accent="text-emerald-600"
          />
          <StatCard
            label="At-Risk Students"
            value={data?.at_risk_students ?? 0}
            accent="text-rose-600"
          />
          <StatCard label="Active Courses" value={data?.active_courses ?? 0} />
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
