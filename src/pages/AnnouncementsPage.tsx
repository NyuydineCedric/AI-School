import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Megaphone } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  course: string;
  date: string;
}

const seed: Announcement[] = [
  {
    id: "1",
    title: "Midterm Rescheduled",
    body: "The midterm has moved to next Monday.",
    course: "Database Systems",
    date: "Jul 24, 2026",
  },
  {
    id: "2",
    title: "Office Hours Update",
    body: "Office hours now on Wednesdays 2-4pm.",
    course: "All Courses",
    date: "Jul 20, 2026",
  },
];

const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState(seed);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [course, setCourse] = useState("All Courses");

  const post = () => {
    if (!title.trim() || !body.trim()) return;
    setAnnouncements((prev) => [
      { id: crypto.randomUUID(), title, body, course, date: "Just now" },
      ...prev,
    ]);
    setTitle("");
    setBody("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="announcements" />
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
              <option>Data Structures</option>
              <option>Operating Systems</option>
              <option>Database Systems</option>
            </select>
            <button
              onClick={post}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Post Announcement
            </button>
          </div>
        </div>

        <div className="space-y-3">
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
                <span className="text-xs text-slate-400 ml-auto">{a.date}</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">{a.body}</p>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                {a.course}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AnnouncementsPage;
