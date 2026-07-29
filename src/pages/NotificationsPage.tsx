import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

const seed: Notification[] = [
  {
    id: "1",
    text: "Dr. Smith uploaded Database Assignment",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    text: "AI graded your Quiz - Operating Systems",
    time: "5h ago",
    read: false,
  },
  {
    id: "3",
    text: "Exam scheduled for Database Systems",
    time: "1d ago",
    read: true,
  },
  { id: "4", text: "New message from Dr. Johnson", time: "2d ago", read: true },
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState(seed);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="notifications" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-slate-800">
            Notifications
          </h1>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-sm text-indigo-600 font-medium"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                <Bell size={15} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm ${n.read ? "text-slate-500" : "text-slate-800 font-medium"}`}
                >
                  {n.text}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
