import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/auth";
import { getNotifications } from "../lib/api";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  HelpCircle,
  FileText,
  StickyNote,
  Bot,
  MessageSquare,
  GraduationCap,
  CalendarCheck,
  Calendar,
  Bell,
  User,
  Settings,
  Users,
  FolderKanban,
  Sparkles,
  CheckSquare,
  BarChart3,
  Megaphone,
  LogOut,
  Shield,
  Award,
} from "lucide-react";
import { Role } from "../types";

const ICONS: Record<string, React.ComponentType<any>> = {
  dashboard: LayoutDashboard,
  courses: BookOpen,
  students: Users,
  assignments: ClipboardList,
  quizzes: HelpCircle,
  exams: FileText,
  notes: StickyNote,
  aitutor: Bot,
  messages: MessageSquare,
  grades: GraduationCap,
  attendance: CalendarCheck,
  calendar: Calendar,
  notifications: Bell,
  profile: User,
  settings: Settings,
  questionbank: FolderKanban,
  aiassistant: Sparkles,
  aimarking: CheckSquare,
  analytics: BarChart3,
  announcements: Megaphone,
  admin: Shield,
  certificates: Award,
};

interface NavEntry {
  key: string;
  label: string;
}

const STUDENT_NAV: NavEntry[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "courses", label: "Courses" },
  { key: "assignments", label: "Assignments" },
  { key: "quizzes", label: "Quizzes" },
  { key: "exams", label: "Exams" },
  { key: "notes", label: "Notes" },
  { key: "aitutor", label: "AI Tutor" },
  { key: "messages", label: "Messages" },
  { key: "grades", label: "Grades" },
  { key: "attendance", label: "Attendance" },
  { key: "calendar", label: "Calendar" },
  { key: "notifications", label: "Notifications" },
  { key: "profile", label: "Profile" },
  { key: "settings", label: "Settings" },
];

const TEACHER_NAV: NavEntry[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "courses", label: "Courses" },
  { key: "students", label: "Students" },
  { key: "assignments", label: "Assignments" },
  { key: "quizzes", label: "Quizzes" },
  { key: "exams", label: "Exams" },
  { key: "questionbank", label: "Question Bank" },
  { key: "aiassistant", label: "AI Assistant" },
  { key: "aitutor", label: "AI Marking" },
  { key: "attendance", label: "Attendance" },
  { key: "analytics", label: "Analytics" },
  { key: "announcements", label: "Announcements" },
  { key: "messages", label: "Messages" },
  { key: "settings", label: "Settings" },
];

// Admins get a focused nav: manage accounts, oversee the school-wide
// picture, and use the same AI/communication tools as everyone else —
// not the full teacher toolkit (no Courses, Students, Quizzes, etc.).
const ADMIN_NAV: NavEntry[] = [
  { key: "admin", label: "User Management" },
  { key: "dashboard", label: "Dashboard" },
  { key: "certificates", label: "Certificates" },
  { key: "aiassistant", label: "AI Assistant" },
  { key: "analytics", label: "Analytics" },
  { key: "announcements", label: "Announcements" },
  { key: "messages", label: "Messages" },
  { key: "settings", label: "Settings" },
];

// Only keys with a built page get a real route. Everything else in the nav
// (Notes, Messages, Attendance, Calendar, Notifications, Profile, Settings,
// Students, Question Bank, Analytics, Announcements, Certificates, etc.) is
// shown for visual completeness but has no page yet, so it isn't wired to
// a route.
const STUDENT_ROUTES: Record<string, string> = {
  dashboard: "/student/dashboard",
  courses: "/student/courses",
  assignments: "/student/assignments",
  quizzes: "/student/quizzes",
  exams: "/student/exams",
  grades: "/student/grades",
  aitutor: "/student/ai-tutor",
  notes: "/student/notes",
  messages: "/student/messages",
  attendance: "/student/attendance",
  calendar: "/student/calendar",
  notifications: "/student/notifications",
  profile: "/student/profile",
  settings: "/student/settings",
};

const TEACHER_ROUTES: Record<string, string> = {
  dashboard: "/teacher/dashboard",
  aiassistant: "/teacher/ai-question-generator",
  aitutor: "/teacher/ai-marking",
  courses: "/teacher/courses",
  students: "/teacher/students",
  assignments: "/teacher/assignments",
  quizzes: "/teacher/quizzes",
  exams: "/teacher/exams",
  questionbank: "/teacher/question-bank",
  attendance: "/teacher/attendance",
  analytics: "/teacher/analytics",
  announcements: "/teacher/announcements",
  messages: "/teacher/messages",
  settings: "/teacher/settings",
};

// Admin gets its own URLs — even though several reuse the exact same page
// component as the teacher nav, the route itself must be distinct so the
// router can pass role="admin" instead of role="teacher" into Sidebar.
// Reusing /teacher/... paths here was the bug: the role baked into that
// route's element never matched the actual logged-in admin.
const ADMIN_ROUTES: Record<string, string> = {
  admin: "/admin/users",
  dashboard: "/admin/dashboard",
  aiassistant: "/admin/ai-assistant",
  analytics: "/admin/analytics",
  announcements: "/admin/announcements",
  messages: "/admin/messages",
  settings: "/admin/settings",
  // certificates: "/admin/certificates", // uncomment once that page exists
};

interface SidebarProps {
  role: Role;
  active: string; // matches NavEntry.key
}

const Sidebar: React.FC<SidebarProps> = ({ role, active }) => {
    // Stores how many notifications are still unread
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications when the Sidebar first appears
  useEffect(() => {
    // Only students currently have a Notifications page
    if (role !== "student") return;

    getNotifications()
  .then((list: { id: string; text: string; read: boolean; created_at: string }[]) => {
    // Count only the unread notifications
    const count = list.filter((n) => !n.read).length;
    setUnreadCount(count);
  })
      .catch(() => {
        // If the request fails, just show 0
        setUnreadCount(0);
      });
  }, [role]);
  const items =
    role === "admin"
      ? ADMIN_NAV
      : role === "teacher"
        ? TEACHER_NAV
        : STUDENT_NAV;
  const routes =
    role === "admin"
      ? ADMIN_ROUTES
      : role === "teacher"
        ? TEACHER_ROUTES
        : STUDENT_ROUTES;
  const navigate = useNavigate();

  return (
    <aside className="w-60 shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
      <Link
        to="/"
        className="flex items-center gap-2 px-5 h-16 border-b border-slate-200"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        <span className="font-semibold text-slate-800 text-[15px]">
          Smart School AI
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const isActive = item.key === active;
          const path = routes[item.key];
          const className = `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
            isActive
              ? "bg-indigo-50 text-indigo-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`;
          const content = (
  <>
    <Icon
      size={17}
      className={isActive ? "text-indigo-600" : "text-slate-400"}
    />
    <span className="flex-1">{item.label}</span>

    {/* Show the number badge only for Notifications and only when there are unread ones */}
    {item.key === "notifications" && unreadCount > 0 && (
      <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold">
        {unreadCount}
      </span>
    )}
  </>
);

          // Pages that exist get real client-side navigation.
          if (path) {
            return (
              <Link key={item.key} to={path} className={className}>
                {content}
              </Link>
            );
          }

          // Pages not built yet: kept visible for layout fidelity, but not clickable.
          return (
            <div
              key={item.key}
              className={`${className} cursor-not-allowed opacity-60`}
              title="Page coming soon"
            >
              {content}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={() => {
            clearSession();
            navigate("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-500 hover:bg-slate-50 hover:text-rose-600"
        >
          <LogOut size={17} className="text-slate-400" />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
