import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/auth";
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
  aiassistant: FileText,
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

  { key: "aiassistant", label: "Exams" },

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
  { key: "aiassistant", label: "Exams" },
  { key: "analytics", label: "Analytics" },
  { key: "announcements", label: "Announcements" },
  { key: "messages", label: "Messages" },
  { key: "settings", label: "Settings" },
];

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
              {item.label}
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
