import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Role } from "../types";

const studentRows = [
  { date: "Jul 21, 2026", course: "Data Structures", status: "Present" },
  { date: "Jul 22, 2026", course: "Operating Systems", status: "Present" },
  { date: "Jul 23, 2026", course: "Database Systems", status: "Absent" },
  { date: "Jul 24, 2026", course: "Computer Networks", status: "Present" },
];

const classRoster = ["Alex Morgan", "Samantha Lee", "Daniel Kim", "Cedric N."];

const AttendancePage: React.FC<{ role: Role }> = ({ role }) => {
  const [marks, setMarks] = useState<Record<string, "Present" | "Absent">>(
    Object.fromEntries(classRoster.map((n) => [n, "Present"])),
  );

  const toggle = (name: string) =>
    setMarks((prev) => ({
      ...prev,
      [name]: prev[name] === "Present" ? "Absent" : "Present",
    }));

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="attendance" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Attendance
        </h1>

        {role === "student" ? (
          <>
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5 flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500">This Month</p>
                <p className="text-2xl font-bold text-emerald-600">92%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Classes Attended</p>
                <p className="text-2xl font-bold text-slate-800">46 / 50</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs">
                    <th className="text-left font-medium px-5 py-3">Date</th>
                    <th className="text-left font-medium px-5 py-3">Course</th>
                    <th className="text-left font-medium px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentRows.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-5 py-3 text-slate-700">{r.date}</td>
                      <td className="px-5 py-3 text-slate-600">{r.course}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-md ${
                            r.status === "Present"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 font-semibold text-sm text-slate-800">
              Data Structures — Today
            </div>
            <table className="w-full text-sm">
              <tbody>
                {classRoster.map((name) => (
                  <tr key={name} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">{name}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggle(name)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md ${
                          marks[name] === "Present"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {marks[name]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-slate-100">
              <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
                Save Attendance
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendancePage;
