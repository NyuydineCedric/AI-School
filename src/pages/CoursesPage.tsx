import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import {
  Search,
  AlertCircle,
  ClipboardList,
  HelpCircle,
  FileText,
  StickyNote,
} from "lucide-react";
import {
  getCourses,
  getAssignments,
  getQuizzes,
  getExams,
  getSharedNotes,
} from "../lib/api";

interface Course {
  id: string;
  name: string;
  instructor?: string;
  progress?: number;
  color: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getCourses(),
      getAssignments(),
      getQuizzes(),
      getExams(),
      getSharedNotes(),
    ])
      .then(
        ([coursesData, assignmentsData, quizzesData, examsData, notesData]) => {
          setCourses(coursesData);
          setAssignments(assignmentsData);
          setQuizzes(quizzesData);
          setExams(examsData);
          setSharedNotes(notesData);
        },
      )
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load courses.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="courses" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-slate-800">My Courses</h1>
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              placeholder="Search courses..."
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none w-56"
            />
          </div>
        </div>

        {loading && <p className="text-sm text-slate-400">Loading courses…</p>}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <Link to={`/student/courses/${c.id}`} className="block">
                <div className={`h-20 ${c.color}`} />
                <div className="p-4 pb-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    {c.name}
                  </p>
                  {c.instructor && (
                    <p className="text-xs text-slate-400 mb-3">
                      {c.instructor}
                    </p>
                  )}
                  {c.progress !== undefined && (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{c.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full">
                        <div
                          className="h-1.5 bg-indigo-500 rounded-full"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link
                  to={`/student/courses/${c.id}`}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  <StickyNote size={14} />
                  Notes
                  {sharedNotes.filter((n) => n.course_name === c.name).length >
                    0 && (
                    <span className="text-xs font-normal text-slate-400">
                      (
                      {
                        sharedNotes.filter((n) => n.course_name === c.name)
                          .length
                      }
                      )
                    </span>
                  )}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursesPage;
