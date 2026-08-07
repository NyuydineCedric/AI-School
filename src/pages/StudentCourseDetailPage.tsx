import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  ChevronLeft,
  StickyNote,
  ClipboardList,
  HelpCircle,
  FileText,
  AlertCircle,
  X,
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

interface Note {
  id: string;
  course_name: string;
  content: string;
  created_at?: string;
}

const NOTE_PREVIEW_LENGTH = 60;

// Turns a note's raw content into a short single-line label, e.g. for use
// as the clickable title in the notes list. Falls back to a generic label
// if the note is somehow empty.
function notePreview(content: string): string {
  const firstLine = content.trim().split("\n")[0] ?? "";
  if (!firstLine) return "Untitled note";
  return firstLine.length > NOTE_PREVIEW_LENGTH
    ? `${firstLine.slice(0, NOTE_PREVIEW_LENGTH).trim()}…`
    : firstLine;
}

const StudentCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The note currently open in the "view note" modal, or null when closed.
  const [openNote, setOpenNote] = useState<Note | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getCourses(),
      getAssignments(),
      getQuizzes(),
      getExams(),
      getSharedNotes(),
    ])
      .then(([courses, allAssignments, allQuizzes, allExams, allNotes]) => {
        const found = courses.find((c: Course) => c.id === id) ?? null;
        setCourse(found);
        setAssignments(allAssignments.filter((a: any) => a.course_id === id));
        setQuizzes(allQuizzes.filter((q: any) => q.course === found?.name));
        setExams(allExams.filter((e: any) => e.course === found?.name));
        setNotes(allNotes.filter((n: any) => n.course_name === found?.name));
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load course."),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="courses" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link
          to="/student/courses"
          className="flex items-center gap-1 text-sm text-slate-500 mb-4 w-fit"
        >
          <ChevronLeft size={14} /> Back to Courses
        </Link>

        {loading && <p className="text-sm text-slate-400">Loading course…</p>}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {course && (
          <>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">
              {course.name}
            </h1>
            {course.instructor && (
              <p className="text-sm text-slate-500 mb-6">{course.instructor}</p>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">
                  Class Notes
                </h3>
                {notes.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Your teacher hasn't posted notes for this course yet.
                  </p>
                )}
                <div className="space-y-3">
                  {notes.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setOpenNote(n)}
                      className="w-full text-left border border-slate-100 rounded-lg p-3 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <StickyNote size={14} className="text-indigo-500" />
                        <span className="text-xs font-medium text-indigo-600">
                          Note
                        </span>
                        {n.created_at && (
                          <span className="text-[11px] text-slate-400">
                            • {n.created_at}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 font-medium truncate">
                        {notePreview(n.content)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Assignments
                  </h3>
                  <div className="space-y-2">
                    {assignments.length === 0 && (
                      <p className="text-xs text-slate-400">None yet.</p>
                    )}
                    {assignments.map((a) => (
                      <Link
                        key={a.id}
                        to={`/student/assignments/${a.id}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                      >
                        <ClipboardList size={14} className="text-indigo-500" />
                        {a.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Quizzes
                  </h3>
                  <div className="space-y-2">
                    {quizzes.length === 0 && (
                      <p className="text-xs text-slate-400">None yet.</p>
                    )}
                    {quizzes.map((q) => (
                      <Link
                        key={q.id}
                        to={`/student/quizzes/${q.id}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                      >
                        <HelpCircle size={14} className="text-amber-500" />
                        {q.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">
                    Exams
                  </h3>
                  <div className="space-y-2">
                    {exams.length === 0 && (
                      <p className="text-xs text-slate-400">None yet.</p>
                    )}
                    {exams.map((e) => (
                      <Link
                        key={e.id}
                        to={`/student/exams/${e.id}`}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600"
                      >
                        <FileText size={14} className="text-rose-500" />
                        {e.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal shown when a note is clicked. Shows the full note content
          that used to be dumped inline into the Class Notes list. */}
      {openNote && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setOpenNote(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <StickyNote size={16} className="text-indigo-500" />
                <div>
                  <p className="text-[11px] font-medium text-indigo-600">
                    Note • {openNote.course_name}
                  </p>
                  {openNote.created_at && (
                    <p className="text-[11px] text-slate-400">
                      {openNote.created_at}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpenNote(null)}
                className="text-slate-400 hover:text-slate-600 shrink-0"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {openNote.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourseDetailPage;
