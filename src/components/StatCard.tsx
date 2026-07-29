import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: string; // tailwind text color class for value
}

const StatCard: React.FC<StatCardProps> = ({ label, value, accent = 'text-slate-800' }) => (
  <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex-1">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`text-2xl font-semibold mt-1 ${accent}`}>{value}</p>
  </div>
);

export default StatCard;
