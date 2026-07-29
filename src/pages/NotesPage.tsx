import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { StickyNote, Plus } from "lucide-react";

interface Note {
  id: string;
  course: string;
  content: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    course: "Data Structures",
    content:
      "Stack = LIFO, Queue = FIFO. Review linked list traversal before the quiz.",
  },
  {
    id: "2",
    course: "Operating Systems",
    content:
      "Round Robin uses a fixed time quantum — check preemption rules for the exam.",
  },
  {
    id: "3",
    course: "Database Systems",
    content: "3NF removes transitive dependency. BCNF is stricter than 3NF.",
  },
];

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [course, setCourse] = useState("Data Structures");

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes((prev) => [
      { id: crypto.randomUUID(), course, content: draft.trim() },
      ...prev,
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="notes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">My Notes</h1>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="flex gap-3 mb-3">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option>Data Structures</option>
              <option>Operating Systems</option>
              <option>Database Systems</option>
            </select>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a quick note..."
            className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none h-20"
          />
          <button
            onClick={addNote}
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
                  {n.course}
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
