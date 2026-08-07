import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Megaphone, StickyNote } from "lucide-react";
import { Role } from "../types";
import {
  createSharedNote,
  getAnnouncements,
  createAnnouncement,
  getSharedNotes,
  getCourses,
} from "../lib/api";

interface Announcement {
  id: string;
  title: string;
  body: string;
  course_name: string;
}

const AnnouncementsPage: React.FC<{ role: Role }> = ({ role }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sharedNotes, setSharedNotes] = useState<any[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("All Courses");
  const [noteCourse, setNoteCourse] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const load = () => {
    getAnnouncements()
      .then(setAnnouncements)
      .catch(() => setAnnouncements([]));
    getSharedNotes()
      .then(setSharedNotes)
      .catch(() => setSharedNotes([]));
    getCourses()
      .then((data) => {
        setCourses(data);
        if (data[0]) setNoteCourse(data[0].name);
      })
      .catch(() => setCourses([]));
  };

  useEffect(() => {
    load();
  }, []);

  const post = async () => {
    if (!title.trim() || !body.trim()) return;
    const created = await createAnnouncement(title, body, course);
    setAnnouncements((prev) => [created, ...prev]);
    setTitle("");
    setBody("");
  };

  const publishNote = async () => {
    if (!noteBody.trim() || !noteCourse) return;
    const created = await createSharedNote(noteCourse, noteBody.trim());
    setSharedNotes((prev) => [created, ...prev]);
    setNoteBody("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="announcements" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Announcements
        </h1>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none resize-none h-20"
          />
          <div className="flex items-center justify-between">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option>All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={post}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Post Announcement
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Publish a class note
          </h2>
          <select
            value={noteCourse}
            onChange={(e) => setNoteCourse(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-3 w-full"
          >
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write a note for students..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none h-20 mb-3"
          />
          <button
            onClick={publishNote}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Publish Note
          </button>
        </div>

        <div className="space-y-3">
          {sharedNotes.map((n) => (
            <div
              key={n.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <StickyNote size={14} className="text-indigo-500" />
                <p className="text-sm font-semibold text-slate-800">
                  Shared note · {n.course_name}
                </p>
              </div>
              <p className="text-sm text-slate-600">{n.content}</p>
            </div>
          ))}
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-slate-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <Megaphone size={14} className="text-indigo-500" />
                <p className="text-sm font-semibold text-slate-800">
                  {a.title}
                </p>
              </div>
              <p className="text-sm text-slate-600 mb-1">{a.body}</p>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                {a.course_name}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnnouncementsPage;
