import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { createExam, getCourses, getExams } from "../lib/api";

const TeacherExamsPage: React.FC = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState(120);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    getExams()
      .then(setExams)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load exams."),
      );
    getCourses()
      .then(setCourses)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load courses."),
      );
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!courseId || !title.trim() || !instructions.trim()) return;
    setError(null);
    try {
      const created = await createExam(
        courseId,
        title.trim(),
        instructions.trim(),
        duration,
      );
      setExams((prev) => [created, ...prev]);
      setTitle("");
      setInstructions("");
      setDuration(120);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish exam.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="exams" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Exams</h1>
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Exam title"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions"
              className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-24"
            />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Publish Exam
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{exam.title}</td>
                  <td className="px-5 py-3 text-slate-600">{exam.course}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {exam.duration_minutes} mins
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/teacher/review?type=exams&id=${exam.id}`}
                      className="text-sm text-indigo-600 font-medium"
                    >
                      Review
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

export default TeacherExamsPage;
