import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

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
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedRoute allow={["student"]}>
              <CoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments/:id"
          element={
            <ProtectedRoute allow={["student"]}>
              <AssignmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/quizzes/:id"
          element={
            <ProtectedRoute allow={["student"]}>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/exams/:id"
          element={
            <ProtectedRoute allow={["student"]}>
              <ExamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allow={["student"]}>
              <GradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/ai-tutor"
          element={
            <ProtectedRoute allow={["student"]}>
              <AITutorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notes"
          element={
            <ProtectedRoute allow={["student"]}>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/messages"
          element={
            <ProtectedRoute allow={["student"]}>
              <MessagesPage role="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute allow={["student"]}>
              <AttendancePage role="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/calendar"
          element={
            <ProtectedRoute allow={["student"]}>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute allow={["student"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allow={["student"]}>
              <ProfilePage role="student" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allow={["student"]}>
              <SettingsPage role="student" />
            </ProtectedRoute>
          }
        />

        {/* Teacher */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/ai-question-generator"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <AIQuestionGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/ai-marking"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <AIMarkingCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherAssignmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherQuizzesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/question-bank"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <QuestionBankPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <AttendancePage role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/analytics"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/announcements"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <AnnouncementsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <MessagesPage role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <SettingsPage role="teacher" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
