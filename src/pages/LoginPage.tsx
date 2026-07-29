import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Eye } from 'lucide-react';

type LoginRole = 'teacher' | 'student' | 'admin';

// Admin dashboard isn't built yet, so admin logins land on the teacher
// dashboard for now — swap this once an admin page exists.
const ROLE_ROUTES: Record<LoginRole, string> = {
  teacher: '/teacher/dashboard',
  student: '/student/dashboard',
  admin: '/teacher/dashboard',
};

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<LoginRole>('teacher');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(ROLE_ROUTES[role]);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left illustration panel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50/60 relative overflow-hidden">
        <div className="absolute top-10 left-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">Smart School AI</span>
        </div>
        <div className="w-40 h-56 bg-indigo-600 rounded-full opacity-90" />
        <div className="w-48 h-32 bg-white rounded-xl shadow-lg absolute bottom-24 left-16 border border-slate-200" />
      </div>

      {/* Right form panel */}
      <div className="flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Login to your account</p>

          <label className="block text-sm font-medium text-slate-700 mb-1">School Code</label>
          <input
            type="text"
            placeholder="Enter school code"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <div className="relative mb-2">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Eye size={16} className="absolute right-3 top-3 text-slate-400" />
          </div>

          <div className="flex items-center justify-between text-sm mb-6">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
              Remember me
            </label>
            <a href="#" className="text-indigo-600 font-medium">
              Forgot password?
            </a>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg mb-6"
          >
            Login
          </button>

          <p className="text-center text-xs text-slate-400 mb-3">Login as</p>
          <div className="grid grid-cols-3 gap-3">
            {(['teacher', 'student', 'admin'] as LoginRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium capitalize ${
                  role === r
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                <GraduationCap size={16} />
                {r}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Don&apos;t have an account? Contact your school admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
