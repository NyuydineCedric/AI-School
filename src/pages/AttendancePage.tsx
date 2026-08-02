import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Role } from "../types";
import {
  getAttendance,
  getStudents,
  markAttendance,
  getCourses,
} from "../lib/api";

interface StudentRow {
  id: string;
  name: string;
  attendance: string;
  grade: string;
}

const AttendancePage: React.FC<{ role: Role }> = ({ role }) => {
  const [studentData, setStudentData] = useState<{
    rows: any[];
    percentage: number;
    attended: number;
    total: number;
  } | null>(null);
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [marks, setMarks] = useState<Record<string, "Present" | "Absent">>({});
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (role === "student") {
      getAttendance()
        .then(setStudentData)
        .catch(() => setStudentData(null));
    } else {
      getStudents().then((students: StudentRow[]) => {
        setRoster(students);
        setMarks(Object.fromEntries(students.map((s) => [s.id, "Present"])));
      });
      getCourses().then((courseList) => {
        setCourses(courseList);
        setCourseId(courseList[0]?.id ?? "");
      });
    }
  }, [role]);

  const toggle = (id: string) =>
    setMarks((prev) => ({
      ...prev,
      [id]: prev[id] === "Present" ? "Absent" : "Present",
    }));

  const handleSave = async () => {
    if (!courseId) return;
    await markAttendance(courseId, marks);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
                <p className="text-2xl font-bold text-emerald-600">
                  {studentData?.percentage ?? 0}%
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Classes Attended</p>
                <p className="text-2xl font-bold text-slate-800">
                  {studentData?.attended ?? 0} / {studentData?.total ?? 0}
                </p>
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
                  {studentData?.rows.map((r: any, i: number) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-5 py-3 text-slate-700">{r.date}</td>
                      <td className="px-5 py-3 text-slate-600">{r.course}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-md ${r.status === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
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
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
              <span className="font-semibold text-sm text-slate-800">
                Today
              </span>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none"
              >
                {courses.length === 0 && (
                  <option value="">No courses yet</option>
                )}
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {roster.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">{s.name}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggle(s.id)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-md ${marks[s.id] === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                      >
                        {marks[s.id]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {saved ? "Saved ✓" : "Save Attendance"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AttendancePage;
