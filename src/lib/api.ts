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

// ---------- Auth ----------
export interface LoginResult {
  access_token: string;
  role: 'student' | 'teacher' | 'admin';
  name: string;
  user_id: string;
}

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

// ---------- Courses ----------
export const getCourses = () => apiGet<any[]>('/courses');

export const getQuizzes = () => apiGet<any[]>('/quizzes');
export const getExams = () => apiGet<any[]>('/exams');
export const getStudentDashboard = () => apiGet<any>('/dashboard/student');
export const getTeacherDashboard = () => apiGet<any>('/dashboard/teacher');

// ---------- Assignments ----------
export const getAssignments = () => apiGet<any[]>('/assignments');
export const getAssignment = (id: string) => apiGet<any>(`/assignments/${id}`);
export const submitAssignment = (id: string, content: string) =>
  apiPost<any>(`/assignments/${id}/submit`, { content });

// ---------- Quizzes ----------
export const getQuiz = (id: string) => apiGet<any>(`/quizzes/${id}`);
export const submitQuiz = (id: string, answers: Record<string, string>) =>
  apiPost<any>(`/quizzes/${id}/submit`, { answers });

// ---------- Exams ----------
export const getExam = (id: string) => apiGet<any>(`/exams/${id}`);
export const saveExamAnswer = (id: string, answer_text: string) =>
  apiPost<any>(`/exams/${id}/answer`, { answer_text });

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