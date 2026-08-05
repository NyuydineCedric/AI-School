import { getToken, clearSession } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearSession();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(errText || response.statusText);
  }
  return response;
}

async function apiGet<T>(path: string): Promise<T> {
  return (await authFetch(path)).json();
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return (await authFetch(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined })).json();
}

async function apiDelete<T>(path: string): Promise<T> {
  return (await authFetch(path, { method: 'DELETE' })).json();
}

// ---------- Auth ----------
export interface LoginResult {
  access_token: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  user_id: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  bio: string;
}

export const getMe = () => apiGet<Profile>('/auth/me');
export const updateProfile = (name: string, email: string, bio: string) =>
  apiPost<Profile>('/auth/profile', { name, email, bio });
export const changePassword = (current_password: string, new_password: string) =>
  apiPost<{ saved: boolean }>('/auth/change-password', { current_password, new_password });

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(errText || 'Login failed');
  }
  return response.json();
}

// Public self-registration is student-only — the backend rejects any other
// role (see routers/auth.py). Teacher/admin accounts are created from the
// admin User Management page instead.
export async function register(name: string, email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role: 'student' }),
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(errText || 'Registration failed');
  }
  return response.json();
}

// ---------- Courses ----------
export const getCourses = () => apiGet<any[]>('/courses');
export const createCourse = (name: string, color = 'bg-indigo-100') => apiPost<any>('/courses', { name, color });

export const getQuizzes = () => apiGet<any[]>('/quizzes');
export const createQuiz = (course_id: string, title: string, duration_minutes: number, questions: any[]) =>
  apiPost<any>('/quizzes', { course_id, title, duration_minutes, questions });
export const getExams = () => apiGet<any[]>('/exams');
export const createExam = (course_id: string, title: string, instructions: string, duration_minutes = 120) =>
  apiPost<any>('/exams', { course_id, title, instructions, duration_minutes });
export const getStudentDashboard = () => apiGet<any>('/dashboard/student');
export const getTeacherDashboard = () => apiGet<any>('/dashboard/teacher');
export const getSharedDashboardUpdates = () => apiGet<any>('/dashboard/teacher');

// ---------- Assignments ----------
export const getAssignments = () => apiGet<any[]>('/assignments');
export const createAssignment = (course_id: string, title: string, instructions: string, due_date?: string, max_marks = 20) =>
  apiPost<any>('/assignments', { course_id, title, instructions, due_date, max_marks });
export const getAssignment = (id: string) => apiGet<any>(`/assignments/${id}`);
export const submitAssignment = (id: string, content: string) =>
  apiPost<any>(`/assignments/${id}/submit`, { content });
export const getAssignmentSubmissions = (id: string) => apiGet<any[]>(`/assignments/${id}/submissions`);
export const markAssignmentSubmission = (assignmentId: string, submissionId: string, score: string, feedback?: string) =>
  apiPost<any>(`/assignments/${assignmentId}/submissions/${submissionId}/mark`, { score, feedback });

// ---------- Quizzes ----------
export const getQuiz = (id: string) => apiGet<any>(`/quizzes/${id}`);
export const submitQuiz = (id: string, answers: Record<string, string>) =>
  apiPost<any>(`/quizzes/${id}/submit`, { answers });
export const getQuizAttempts = (id: string) => apiGet<any[]>(`/quizzes/${id}/attempts`);
export const scoreQuizAttempt = (quizId: string, attemptId: string, score: number) =>
  apiPost<any>(`/quizzes/${quizId}/attempts/${attemptId}/score`, { score });

// ---------- Exams ----------
export const getExam = (id: string) => apiGet<any>(`/exams/${id}`);
export const saveExamAnswer = (id: string, answer_text: string) =>
  apiPost<any>(`/exams/${id}/answer`, { answer_text });
export const getExamAnswers = (id: string) => apiGet<any[]>(`/exams/${id}/answers`);
export const markExamAnswer = (examId: string, answerId: string, score: string, feedback?: string) =>
  apiPost<any>(`/exams/${examId}/answers/${answerId}/mark`, { score, feedback });

// ---------- Grades ----------
export const getGrades = () => apiGet<any>('/grades');

// ---------- Attendance ----------
export const getAttendance = () => apiGet<any>('/attendance');
export const markAttendance = (course_id: string, marks: Record<string, string>) =>
  apiPost<any>('/attendance/mark', { course_id, marks });

// ---------- Students ----------
export const getStudents = () => apiGet<any[]>('/students');

// ---------- Question bank ----------
export const getQuestionBank = () => apiGet<any[]>('/question-bank');
export const addQuestionBankItem = (course_name: string, text: string, difficulty = 'Medium') =>
  apiPost<any>('/question-bank', { course_name, text, difficulty });

// ---------- Analytics ----------
export const getAnalytics = () => apiGet<any>('/analytics');

// ---------- Notes ----------
export const getNotes = () => apiGet<any[]>('/notes');
export const addNote = (course_name: string, content: string) =>
  apiPost<any>('/notes', { course_name, content });
export const getSharedNotes = () => apiGet<any[]>('/shared-notes');
export const createSharedNote = (course_name: string, content: string) =>
  apiPost<any>('/shared-notes', { course_name, content });
export const generateCourseNotes = (course_name: string, topic = '') =>
  apiPost<{ content: string }>('/ai/generate-notes', { course_name, topic });

// ---------- Messages ----------
export const getConversations = () => apiGet<any[]>('/conversations');
export const getMessages = (conversationId: string) => apiGet<any[]>(`/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId: string, text: string) =>
  apiPost<any>(`/conversations/${conversationId}/messages`, { text });

// ---------- Notifications ----------
export const getNotifications = () => apiGet<any[]>('/notifications');
export const markAllNotificationsRead = () => apiPost<any>('/notifications/mark-all-read');

// ---------- Announcements ----------
export const getAnnouncements = () => apiGet<any[]>('/announcements');
export const createAnnouncement = (title: string, body: string, course_name = 'All Courses') =>
  apiPost<any>('/announcements', { title, body, course_name });

// ---------- Admin ----------
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}
export const adminListUsers = () => apiGet<AdminUser[]>('/admin/users');
export const adminCreateUser = (name: string, email: string, password: string, role: string) =>
  apiPost<AdminUser>('/admin/users', { name, email, password, role });
export const adminResetPassword = (userId: string, new_password: string) =>
  apiPost<{ saved: boolean }>(`/admin/users/${userId}/reset-password`, { new_password });
export const adminDeleteUser = (userId: string) =>
  apiDelete<{ deleted: boolean }>(`/admin/users/${userId}`);

// ---------- AI (tutor / question generator / marking) ----------
export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function streamChatMessage(
  history: ChatMessage[],
  onToken: (chunk: string) => void,
  options?: { accent?: string; temperature?: number }
): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      messages: history,
      ...(options?.accent ? { accent: options.accent } : {}),
      ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
    }),
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`AI request failed (${response.status}): ${errorText || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) onToken(chunk);
  }
}

// ---------- AI document helpers ----------
export async function fetchGeneratedDocument(body: {
  course_name: string;
  topic?: string;
  format?: 'pdf' | 'docx';
  title?: string;
}): Promise<{ blob: Blob; filename: string }> {
  const token = getToken();
  const resp = await fetch(`${API_BASE_URL}/ai/generate-document`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(txt || resp.statusText);
  }

  const blob = await resp.blob();
  const disposition = resp.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : `${body.course_name || 'notes'}.${body.format === 'docx' ? 'docx' : 'pdf'}`;
  return { blob, filename };
}

export async function convertUploadToDocxFile(file: File) {
  const token = getToken();
  const fd = new FormData();
  fd.append('file', file);

  const resp = await fetch(`${API_BASE_URL}/ai/convert-to-docx`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(txt || resp.statusText);
  }

  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name.replace(/\.[^.]+$/, '') + '.docx';
  a.click();
  URL.revokeObjectURL(url);
}

export async function extractTextFromDocument(file: File): Promise<string> {
  const token = getToken();
  const fd = new FormData();
  fd.append('file', file);

  const resp = await fetch(`${API_BASE_URL}/ai/extract-text`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: fd,
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(txt || resp.statusText);
  }

  const data = await resp.json();
  return data.content || '';
}