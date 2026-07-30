import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { StickyNote, Plus } from "lucide-react";
import { getNotes, addNote } from "../lib/api";

interface Note {
  id: string;
  course_name: string;
  content: string;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [course, setCourse] = useState("Data Structures");

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch(() => setNotes([]));
  }, []);

  const handleAdd = async () => {
    if (!draft.trim()) return;
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
            <option>Data Structures</option>
            <option>Operating Systems</option>
            <option>Database Systems</option>
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

        <div className="grid grid-cols-2 gap-4">
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
              <p className="text-sm text-slate-600">{n.content}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotesPage;
