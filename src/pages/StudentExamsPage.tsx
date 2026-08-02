import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { AlertCircle, FileText } from "lucide-react";
import { getExams } from "../lib/api";

interface Exam {
  id: string;
  title: string;
  course?: string;
  duration_minutes: number;
}

const StudentExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExams()
      .then(setExams)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load exams."),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="exams" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Exams</h1>

        {loading && <p className="text-sm text-slate-400">Loading exams…</p>}
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
                <th className="text-left font-medium px-5 py-3">Duration</th>
                <th className="text-left font-medium px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {!loading && exams.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-slate-400"
                  >
                    Nothing here yet — your teacher hasn't scheduled an exam.
                  </td>
                </tr>
              )}
              {exams.map((exam) => (
                <tr key={exam.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-rose-500" />
                      {exam.title}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {exam.course ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {exam.duration_minutes} mins
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/student/exams/${exam.id}`}
                      className="text-sm text-indigo-600 font-medium"
                    >
                      Start
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentExamsPage;
