import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { AlertCircle } from "lucide-react";
import { getAssignments } from "../lib/api";

const CalendarPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssignments()
      .then(setAssignments)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load calendar data.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const eventsByDay: Record<number, string[]> = {};
  assignments.forEach((a) => {
    if (!a.due_date) return;
    const due = new Date(a.due_date);
    if (due.getFullYear() === year && due.getMonth() === month) {
      const day = due.getDate();
      (eventsByDay[day] ??= []).push(a.title);
    }
  });

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const upcoming = assignments
    .filter((a) => a.due_date && new Date(a.due_date) >= startOfToday)
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    )
    .slice(0, 6);

  const leadingBlanks = Array.from({ length: firstWeekday });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="calendar" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Calendar — {monthName} {year}
        </h1>

        {loading && (
          <p className="text-sm text-slate-400 mb-4">Loading calendar…</p>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {leadingBlanks.map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {days.map((d) => {
                const isToday = d === today.getDate();
                const dayEvents = eventsByDay[d] ?? [];
                return (
                  <div
                    key={d}
                    className={`h-14 rounded-lg text-xs p-1.5 border ${
                      dayEvents.length > 0
                        ? "border-indigo-300 bg-indigo-50"
                        : isToday
                          ? "border-indigo-400"
                          : "border-slate-100"
                    }`}
                  >
                    <span
                      className={
                        isToday
                          ? "font-bold text-indigo-600"
                          : "text-slate-600"
                      }
                    >
                      {d}
                    </span>
                    {dayEvents[0] && (
                      <p className="text-[10px] text-indigo-600 mt-1 truncate">
                        {dayEvents[0]}
                        {dayEvents.length > 1
                          ? ` +${dayEvents.length - 1}`
                          : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Upcoming Assignments
            </h3>
            <div className="space-y-3">
              {!loading && upcoming.length === 0 && (
                <p className="text-sm text-slate-400">Nothing due soon.</p>
              )}
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold flex items-center justify-center shrink-0">
                    {new Date(a.due_date).getDate()}
                  </span>
                  <p className="text-sm text-slate-700">{a.title}</p>
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
