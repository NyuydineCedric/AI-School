import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { StickyNote, Plus, BookOpen, X } from "lucide-react";
import { getNotes, addNote, getSharedNotes, getCourses } from "../lib/api";

interface Note {
  id: string;
  course_name: string;
  content: string;
  created_at?: string;
}

const NOTE_PREVIEW_LENGTH = 90;

// Turns a note's raw content into a short single-line preview for the
// card. Falls back to a generic label if the note is somehow empty.
function notePreview(content: string): string {
  const firstLine = content.trim().split("\n")[0] ?? "";
  if (!firstLine) return "Untitled note";
  return firstLine.length > NOTE_PREVIEW_LENGTH
    ? `${firstLine.slice(0, NOTE_PREVIEW_LENGTH).trim()}…`
    : firstLine;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [course, setCourse] = useState("");
  // The note currently open in the "view note" modal, along with which
  // kind it is (used only for the modal's icon/label), or null when closed.
  const [openNote, setOpenNote] = useState<{
    note: Note;
    kind: "shared" | "mine";
  } | null>(null);

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch(() => setNotes([]));
    getSharedNotes()
      .then(setSharedNotes)
      .catch(() => setSharedNotes([]));
    getCourses()
      .then((data) => {
        setCourses(data);
        if (data[0]) setCourse(data[0].name);
      })
      .catch(() => setCourses([]));
  }, []);

  const handleAdd = async () => {
    if (!draft.trim() || !course) return;
    const note = await addNote(course, draft.trim());
    setNotes((prev) => [note, ...prev]);
    setDraft("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="notes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">My Notes</h1>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-3"
          >
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a quick note..."
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none h-20"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg mt-3"
          >
            <Plus size={14} /> Add Note
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Shared class notes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {sharedNotes.map((n) => (
              <button
                key={n.id}
                onClick={() => setOpenNote({ note: n, kind: "shared" })}
                className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-200 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    {n.course_name}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {notePreview(n.content)}
                </p>
              </button>
            ))}
            {sharedNotes.length === 0 && (
              <p className="text-sm text-slate-400 col-span-2">
                No shared notes yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            My notes
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setOpenNote({ note: n, kind: "mine" })}
                className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <StickyNote size={14} className="text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-600">
                    {n.course_name}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {notePreview(n.content)}
                </p>
              </button>
            ))}
            {notes.length === 0 && (
              <p className="text-sm text-slate-400 col-span-2">
                You haven't written any notes yet.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Modal shown when a note card is clicked. Shows the full note
          content that used to be dumped directly into the card. */}
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
                {openNote.kind === "shared" ? (
                  <BookOpen size={16} className="text-emerald-500" />
                ) : (
                  <StickyNote size={16} className="text-indigo-500" />
                )}
                <div>
                  <p
                    className={`text-[11px] font-medium ${
                      openNote.kind === "shared"
                        ? "text-emerald-600"
                        : "text-indigo-600"
                    }`}
                  >
                    {openNote.kind === "shared" ? "Shared note" : "My note"} •{" "}
                    {openNote.note.course_name}
                  </p>
                  {openNote.note.created_at && (
                    <p className="text-[11px] text-slate-400">
                      {openNote.note.created_at}
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
              {openNote.note.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
