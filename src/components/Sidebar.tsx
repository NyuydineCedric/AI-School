import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Role } from '../types';

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
};

interface NavEntry {
  key: string;
  label: string;
}

const STUDENT_NAV: NavEntry[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'courses', label: 'Courses' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'exams', label: 'Exams' },
  { key: 'notes', label: 'Notes' },
  { key: 'aitutor', label: 'AI Tutor' },
  { key: 'messages', label: 'Messages' },
  { key: 'grades', label: 'Grades' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
];

const TEACHER_NAV: NavEntry[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'courses', label: 'Courses' },
  { key: 'students', label: 'Students' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'questionbank', label: 'Question Bank' },
  { key: 'aiassistant', label: 'AI Assistant' },
  { key: 'aitutor', label: 'AI Marking' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'messages', label: 'Messages' },
  { key: 'settings', label: 'Settings' },
];

// Only keys with a built page get a real route. Everything else in the nav
// (Notes, Messages, Attendance, Calendar, Notifications, Profile, Settings,
// Students, Question Bank, Analytics, Announcements, etc.) is shown for visual
// completeness but has no page yet, so it isn't wired to a route.
const STUDENT_ROUTES: Record<string, string> = {
  dashboard: '/student/dashboard',
  courses: '/student/courses',
  assignments: '/student/assignments/1',
  quizzes: '/student/quizzes/1',
  exams: '/student/exams/1',
  grades: '/student/grades',
  aitutor: '/student/ai-tutor',
};

const TEACHER_ROUTES: Record<string, string> = {
  dashboard: '/teacher/dashboard',
  aiassistant: '/teacher/ai-question-generator',
  aitutor: '/teacher/ai-marking',
};

interface SidebarProps {
  role: Role;
  active: string; // matches NavEntry.key
}

const Sidebar: React.FC<SidebarProps> = ({ role, active }) => {
  const items = role === 'teacher' ? TEACHER_NAV : STUDENT_NAV;
  const routes = role === 'teacher' ? TEACHER_ROUTES : STUDENT_ROUTES;

  return (
    <aside className="w-60 shrink-0 h-full bg-white border-r border-slate-200 flex flex-col">
      <Link to="/" className="flex items-center gap-2 px-5 h-16 border-b border-slate-200">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        <span className="font-semibold text-slate-800 text-[15px]">Smart School AI</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const isActive = item.key === active;
          const path = routes[item.key];
          const className = `flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
            isActive
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`;
          const content = (
            <>
              <Icon size={17} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
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
            <div key={item.key} className={`${className} cursor-not-allowed opacity-60`} title="Page coming soon">
              {content}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
