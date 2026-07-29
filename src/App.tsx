import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import CoursesPage from './pages/CoursesPage';
import AssignmentDetails from './pages/AssignmentDetails';
import QuizPage from './pages/QuizPage';
import ExamPage from './pages/ExamPage';
import GradesPage from './pages/GradesPage';
import AITutorPage from './pages/AITutorPage';
import TeacherDashboard from './pages/TeacherDashboard';
import AIQuestionGenerator from './pages/AIQuestionGenerator';
import AIMarkingCenter from './pages/AIMarkingCenter';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<CoursesPage />} />
        <Route path="/student/assignments/:id" element={<AssignmentDetails />} />
        <Route path="/student/quizzes/:id" element={<QuizPage />} />
        <Route path="/student/exams/:id" element={<ExamPage />} />
        <Route path="/student/grades" element={<GradesPage />} />
        <Route path="/student/ai-tutor" element={<AITutorPage />} />

        {/* Teacher */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/ai-question-generator" element={<AIQuestionGenerator />} />
        <Route path="/teacher/ai-marking" element={<AIMarkingCenter />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
