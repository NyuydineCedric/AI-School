import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChevronLeft, Sparkles, StickyNote, AlertCircle, Download, Plus } from "lucide-react";
import {
  getCourses,
  getSharedNotes,
  createSharedNote,
  generateCourseNotes,
  fetchGeneratedDocument,
  extractTextFromDocument,
} from "../lib/api";

interface Course {
  id: string;
  name: string;
  color: string;
  students: number;
  avg: string;
}

interface SharedNoteItem {
  id: string;
  course_name: string;
  content: string;
  created_at?: string;
}

const TeacherCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<SharedNoteItem[]>([]);
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getCourses(), getSharedNotes()])
      .then(([courses, sharedNotes]) => {
        const found = courses.find((c: Course) => c.id === id) ?? null;
        setCourse(found);
        setNotes(
          sharedNotes.filter((n: SharedNoteItem) => n.course_name === found?.name),
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load course."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGenerate = async () => {
    if (!course) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateCourseNotes(course.name, topic.trim());
      setDraft(result.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate notes.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!course || !draft.trim()) return;
    setPublishing(true);
    setError(null);
    try {
      const created = await createSharedNote(course.name, draft.trim());
      setNotes((prev) => [created, ...prev]);
      setDraft("");
      setTopic("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish note.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDownloadDocument = async (format: "pdf" | "docx") => {
    if (!course) return;
    setDownloading(true);
    setError(null);
    try {
      const { blob, filename } = await fetchGeneratedDocument({
        course_name: course.name,
        topic: topic.trim() || course.name,
        format,
        title: `${course.name} - Study Notes`,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to download ${format.toUpperCase()}`
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const extractedContent = await extractTextFromDocument(file);
      setDraft(extractedContent);
      setTopic(""); // Clear topic since we're using uploaded content
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="courses" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link
          to="/teacher/courses"
          className="flex items-center gap-1 text-sm text-slate-500 mb-4 w-fit"
        >
          <ChevronLeft size={14} /> Back to Courses
        </Link>

        {loading && <p className="text-sm text-slate-400">Loading course…</p>}
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {course && (
          <>
            <h1 className="text-xl font-semibold text-slate-800 mb-1">
              {course.name}
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              {course.students} students · {course.avg} average
            </p>

            <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-800">
                  Course Notes
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Generate a draft with AI, then edit before publishing to
                students.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Optional topic to focus on (e.g. 'Binary Trees')"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  {generating ? "Generating…" : "Generate with AI"}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center bg-green-50 text-green-700 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-green-100 transition w-10 h-10"
                  title="Upload document"
                >
                  <Plus size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleUploadDocument}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write or generate note content here…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-40 mb-3"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleDownloadDocument("pdf")}
                  disabled={downloading}
                  className="flex items-center gap-1.5 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-red-100 transition"
                >
                  <Download size={14} />
                  {downloading ? "Downloading…" : "Download PDF"}
                </button>
                <button
                  onClick={() => handleDownloadDocument("docx")}
                  disabled={downloading}
                  className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-100 transition"
                >
                  <Download size={14} />
                  {downloading ? "Downloading…" : "Download DOCX"}
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !draft.trim()}
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
                >
                  {publishing ? "Publishing…" : "Publish Note"}
                </button>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Published Notes ({notes.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {notes.length === 0 && (
                <p className="text-sm text-slate-400 col-span-2">
                  No notes published for this course yet.
                </p>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote size={14} className="text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">
                      {n.course_name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {n.content}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TeacherCourseDetailPage;
