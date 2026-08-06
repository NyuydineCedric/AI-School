import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ChevronLeft, Sparkles, StickyNote, AlertCircle, Download, Plus } from "lucide-react";
import {
  getCourses,
  getSharedNotes,
  createSharedNote,
  getSharedDocuments,
  uploadSharedDocument,
  downloadSharedDocument,
  generateCourseNotes,
  convertTextToDocument,
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

interface SharedDocumentItem {
  id: string;
  course_name: string;
  filename: string;
  content_type: string;
  created_at?: string;
}

const TeacherCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<SharedNoteItem[]>([]);
  const [documents, setDocuments] = useState<SharedDocumentItem[]>([]);
  const [draft, setDraft] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<{
    blob: Blob;
    filename: string;
    format: "pdf" | "docx";
  } | null>(null);
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([getCourses(), getSharedNotes(), getSharedDocuments()])
      .then(([courses, sharedNotes, sharedDocuments]) => {
        const found = courses.find((c: Course) => c.id === id) ?? null;
        setCourse(found);
        setNotes(
          sharedNotes.filter((n: SharedNoteItem) => n.course_name === found?.name),
        );
        setDocuments(
          sharedDocuments.filter((d: SharedDocumentItem) => d.course_name === found?.name),
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

  useEffect(() => {
    return () => {
      if (generatedDocUrl) {
        URL.revokeObjectURL(generatedDocUrl);
      }
    };
  }, [generatedDocUrl]);

  const handleGenerate = async () => {
    if (!course) return;
    setGenerating(true);
    setError(null);
    try {
      const result = await generateCourseNotes(course.name, topic.trim());
      setDraft(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate notes.");
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

  const handleConvertDraftToDocument = async (format: "pdf" | "docx") => {
    if (!course || !draft.trim()) {
      setError("Generate notes first before converting them to a document.");
      return;
    }
    setConverting(true);
    setError(null);
    try {
      const { blob, filename } = await convertTextToDocument({
        course_name: course.name,
        content: draft,
        format,
        title: `${course.name} - Study Notes`,
      });

      if (generatedDocUrl) {
        URL.revokeObjectURL(generatedDocUrl);
      }

      const url = URL.createObjectURL(blob);
      setGeneratedDoc({ blob, filename, format });
      setGeneratedDocUrl(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to convert draft to ${format.toUpperCase()}`
      );
    } finally {
      setConverting(false);
    }
  };

  const handlePublishGeneratedDocument = async () => {
    if (!course || !generatedDoc) return;
    setUploading(true);
    setError(null);
    try {
      const file = new File([generatedDoc.blob], generatedDoc.filename, {
        type:
          generatedDoc.format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const created = await uploadSharedDocument(course.name, file);
      setDocuments((prev) => [created, ...prev]);
      setGeneratedDoc(null);
      if (generatedDocUrl) {
        URL.revokeObjectURL(generatedDocUrl);
        setGeneratedDocUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish generated document");
    } finally {
      setUploading(false);
    }
  };

  const handleUploadDocument = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!/\.(pdf|docx|doc)$/i.test(file.name)) {
      setError("Only PDF/DOC/DOCX files may be published as documents.");
      event.target.value = "";
      return;
    }

    if (!course) return;

    setUploading(true);
    setError(null);
    try {
      const created = await uploadSharedDocument(course.name, file);
      setDocuments((prev) => [created, ...prev]);
      setError(null);
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

  const handleDownloadSharedDocument = async (documentId: string) => {
    setDownloading(true);
    setError(null);
    try {
      const { blob, filename } = await downloadSharedDocument(documentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download document");
    } finally {
      setDownloading(false);
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
                  Course Documents
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Upload the document file and publish it directly for students.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h4 className="text-sm font-semibold text-slate-800">AI Notes</h4>
                  </div>
                  <input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Optional topic to focus on (e.g. 'Binary Trees')"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write or generate note content here…"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-40"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-100 transition"
                    >
                      {generating ? "Generating…" : "Generate with AI"}
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-emerald-600" />
                    <h4 className="text-sm font-semibold text-slate-800">Document Sharing</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Upload a PDF/DOC/DOCX and publish it as a document for students.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-green-100 transition"
                    title="Upload and publish document"
                  >
                    <Plus size={18} />
                    {uploading ? "Uploading…" : "Upload Document"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleUploadDocument}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => handleConvertDraftToDocument("pdf")}
                      disabled={converting || !draft.trim()}
                      className="flex-1 flex items-center gap-1.5 bg-red-50 text-red-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-red-100 transition"
                    >
                      <Download size={14} />
                      {converting ? "Converting…" : "Generate PDF"}
                    </button>
                    <button
                      onClick={() => handleConvertDraftToDocument("docx")}
                      disabled={converting || !draft.trim()}
                      className="flex-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-100 transition"
                    >
                      <Download size={14} />
                      {converting ? "Converting…" : "Generate DOCX"}
                    </button>
                  </div>
                  {generatedDoc && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs text-slate-500 mb-2">
                        Review the generated document before publishing it.
                      </p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-slate-700">{generatedDoc.filename}</span>
                        <a
                          href={generatedDocUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={generatedDoc.filename}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Preview
                        </a>
                        <button
                          onClick={handlePublishGeneratedDocument}
                          disabled={uploading}
                          className="bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
                        >
                          {uploading ? "Publishing…" : "Publish Generated Document"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Published Notes ({notes.length})
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
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

            <h3 className="text-sm font-semibold text-slate-800 mb-3">
              Published Documents ({documents.length})
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {documents.length === 0 && (
                <p className="text-sm text-slate-400 col-span-2">
                  No documents published for this course yet.
                </p>
              )}
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <StickyNote size={14} className="text-indigo-500" />
                      <span className="text-xs font-medium text-indigo-600">
                        {doc.course_name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadSharedDocument(doc.id)}
                      disabled={downloading}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {downloading ? "Downloading…" : "Download"}
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 break-words">
                    {doc.filename}
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
