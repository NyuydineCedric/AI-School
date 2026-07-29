import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import AssignmentDetails from "./pages/AssignmentDetails";
import QuizPage from "./pages/QuizPage";
import ExamPage from "./pages/ExamPage";
import GradesPage from "./pages/GradesPage";
import AITutorPage from "./pages/AITutorPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import AIQuestionGenerator from "./pages/AIQuestionGenerator";
import AIMarkingCenter from "./pages/AIMarkingCenter";

import NotesPage from "./pages/NotesPage";
import MessagesPage from "./pages/MessagesPage";
import AttendancePage from "./pages/AttendancePage";
import CalendarPage from "./pages/CalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import TeacherCoursesPage from "./pages/TeacherCoursesPage";
import StudentsPage from "./pages/StudentsPage";
import TeacherAssignmentsPage from "./pages/TeacherAssignmentsPage";
import TeacherQuizzesPage from "./pages/TeacherQuizzesPage";
import QuestionBankPage from "./pages/QuestionBankPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<CoursesPage />} />
        <Route
          path="/student/assignments/:id"
          element={<AssignmentDetails />}
        />
        <Route path="/student/quizzes/:id" element={<QuizPage />} />
        <Route path="/student/exams/:id" element={<ExamPage />} />
        <Route path="/student/grades" element={<GradesPage />} />
        <Route path="/student/ai-tutor" element={<AITutorPage />} />
        <Route path="/student/notes" element={<NotesPage />} />
        <Route
          path="/student/messages"
          element={<MessagesPage role="student" />}
        />
        <Route
          path="/student/attendance"
          element={<AttendancePage role="student" />}
        />
        <Route path="/student/calendar" element={<CalendarPage />} />
        <Route path="/student/notifications" element={<NotificationsPage />} />
        <Route
          path="/student/profile"
          element={<ProfilePage role="student" />}
        />
        <Route
          path="/student/settings"
          element={<SettingsPage role="student" />}
        />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route
          path="/teacher/ai-question-generator"
          element={<AIQuestionGenerator />}
        />
        <Route path="/teacher/ai-marking" element={<AIMarkingCenter />} />

        <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
        <Route path="/teacher/students" element={<StudentsPage />} />
        <Route
          path="/teacher/assignments"
          element={<TeacherAssignmentsPage />}
        />
        <Route path="/teacher/quizzes" element={<TeacherQuizzesPage />} />
        <Route path="/teacher/question-bank" element={<QuestionBankPage />} />
        <Route
          path="/teacher/attendance"
          element={<AttendancePage role="teacher" />}
        />
        <Route path="/teacher/analytics" element={<AnalyticsPage />} />
        <Route path="/teacher/announcements" element={<AnnouncementsPage />} />
        <Route
          path="/teacher/messages"
          element={<MessagesPage role="teacher" />}
        />
        <Route
          path="/teacher/settings"
          element={<SettingsPage role="teacher" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
