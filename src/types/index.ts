export type Role = 'student' | 'teacher' | 'admin';

export interface NavItem {
  label: string;
  icon: string; // lucide icon name
  path: string;
}

export interface Course {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  color: string; // tailwind bg class for the card accent
}

export interface UpcomingItem {
  id: string;
  title: string;
  type: 'Assignment' | 'Quiz' | 'Exam';
  due: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

export interface GradeRow {
  course: string;
  grade: string;
  score: string;
  credits: number;
}

export interface Student {
  id: string;
  name: string;
  score?: string;
  file?: string;
  status?: 'Marked' | 'Pending';
}
