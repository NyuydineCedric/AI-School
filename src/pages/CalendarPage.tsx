import React from "react";
import Sidebar from "../components/Sidebar";

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const events: Record<number, string> = {
  22: "Operating Systems Quiz",
  24: "Database Systems Exam",
  28: "Assignment Due",
};

const CalendarPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="calendar" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Calendar — July 2026
        </h1>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((d) => (
                <div
                  key={d}
                  className={`h-14 rounded-lg text-xs p-1.5 border ${
                    events[d]
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-100"
                  }`}
                >
                  <span className="text-slate-600">{d}</span>
                  {events[d] && (
                    <p className="text-[10px] text-indigo-600 mt-1 truncate">
                      {events[d]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Upcoming Events
            </h3>
            <div className="space-y-3">
              {Object.entries(events).map(([day, title]) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center">
                    {day}
                  </span>
                  <p className="text-sm text-slate-700">{title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
