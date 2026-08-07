import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import StudentCourseDetailPage from "./pages/StudentCourseDetailPage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import AssignmentDetails from "./pages/AssignmentDetails";
import StudentQuizzesPage from "./pages/StudentQuizzesPage";
import QuizPage from "./pages/QuizPage";
import StudentExamsPage from "./pages/StudentExamsPage";
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
import TeacherCourseDetailPage from "./pages/TeacherCourseDetailPage";
import StudentsPage from "./pages/StudentsPage";
import TeacherAssignmentsPage from "./pages/TeacherAssignmentsPage";
import TeacherQuizzesPage from "./pages/TeacherQuizzesPage";
import TeacherExamsPage from "./pages/TeacherExamsPage";
import QuestionBankPage from "./pages/QuestionBankPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TeacherReviewPage from "./pages/TeacherReviewPage";
import AdminUsersPage from "./pages/AdminUsersPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
          path="/student/courses/:id"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentCourseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/assignments"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentAssignmentsPage />
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
          path="/student/quizzes"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentQuizzesPage />
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
          path="/student/exams"
          element={
            <ProtectedRoute allow={["student"]}>
              <StudentExamsPage />
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
            <ProtectedRoute allow={["teacher"]}>
              <TeacherDashboard role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/ai-question-generator"
          element={
            <ProtectedRoute allow={["teacher"]}>
              <AIQuestionGenerator role="teacher" />
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
          path="/teacher/courses/:id"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherCourseDetailPage />
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
          path="/teacher/exams"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherExamsPage />
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
            <ProtectedRoute allow={["teacher"]}>
              <AnalyticsPage role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/announcements"
          element={
            <ProtectedRoute allow={["teacher"]}>
              <AnnouncementsPage role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/review"
          element={
            <ProtectedRoute allow={["teacher", "admin"]}>
              <TeacherReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <ProtectedRoute allow={["teacher"]}>
              <MessagesPage role="teacher" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allow={["teacher"]}>
              <SettingsPage role="teacher" />
            </ProtectedRoute>
          }
        />

        {/* Admin — dedicated URLs so the Sidebar always gets role="admin",
            even though several of these render the exact same page
            components the teacher nav uses. Sharing /teacher/... URLs
            between roles was the original bug: the role baked into that
            route never matched the actual logged-in admin. */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allow={["admin"]}>
              <TeacherDashboard role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-assistant"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AIQuestionGenerator role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AnalyticsPage role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AnnouncementsPage role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allow={["admin"]}>
              <MessagesPage role="admin" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allow={["admin"]}>
              <SettingsPage role="admin" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
