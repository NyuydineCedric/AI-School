import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, CheckCheck } from "lucide-react";
import { getNotifications, markAllNotificationsRead } from "../lib/api";


interface Notification {
  id: string;
  text: string;
  read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
  const fetchNotifications = () => {
    getNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]));
  };

  fetchNotifications(); // Load immediately

  const interval = setInterval(fetchNotifications, 5000); // Refresh every 5 seconds

  return () => clearInterval(interval);
}, []);

const handleNotificationClick = (id: string) => {
  setOpenId((prev) => (prev === id ? null : id));

  setNotifications((prev) =>
    prev.map((n) =>
      n.id === id
        ? {
            ...n,
            read: true,
          }
        : n
    )
  );
};

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="notifications" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-2">
    <h1 className="text-xl font-semibold text-slate-800">
      Notifications
    </h1>

    {/* This calculates how many notifications are still unread */}
    {notifications.filter((n) => !n.read).length > 0 && (
      <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold">
        {/* Shows the actual number: 1, 2, 3, etc. */}
        {notifications.filter((n) => !n.read).length}
      </span>
    )}
  </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-sm text-indigo-600 font-medium"
          >
            <CheckCheck size={14} /> Mark all as read
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {notifications.map((n) => {
  // Split the text so we can show a short title + full body
  const [title, ...bodyParts] = n.text.split("\n\n");
  const body = bodyParts.join("\n\n");
  const isExpanded = openId === n.id;

  return (
    <div
      key={n.id}
      className="flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => handleNotificationClick(n.id)}
    >
      <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
        <Bell size={15} className="text-indigo-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            n.read ? "text-slate-500" : "text-slate-800 font-medium"
          }`}
        >
          {title}
        </p>

        {/* Show full message only when expanded */}
       {isExpanded && (
  <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
    {body || n.text}
  </p>
)}
      </div>

      {!n.read && (
        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
      )}
    </div>
  );
})}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;
