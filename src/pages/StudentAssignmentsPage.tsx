import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { AlertCircle, ClipboardList } from "lucide-react";
import { getAssignments } from "../lib/api";

interface Assignment {
  id: string;
  title: string;
  course_name?: string;
  due_date?: string;
  max_marks: number;
  submission?: { status: string } | null;
}

const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssignments()
      .then(setAssignments)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load assignments.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Assignments
        </h1>

        {loading && (
          <p className="text-sm text-slate-400">Loading assignments…</p>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Due</th>
                <th className="text-left font-medium px-5 py-3">Max Marks</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!loading && assignments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    Nothing here yet — your teacher hasn't published an
                    assignment.
                  </td>
                </tr>
              )}
              {assignments.map((a) => {
                const status = a.submission?.status ?? "Not Submitted";
                return (
                  <tr key={a.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">
                      <div className="flex items-center gap-2">
                        <ClipboardList size={14} className="text-indigo-500" />
                        {a.title}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {a.course_name ?? "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {a.due_date
                        ? new Date(a.due_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {a.max_marks}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md ${
                          status === "Submitted" || status === "Graded"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        to={`/student/assignments/${a.id}`}
                        className="text-sm text-indigo-600 font-medium"
                      >
                        {status === "Not Submitted" ? "Start" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentAssignmentsPage;
