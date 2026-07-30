import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Eye, AlertCircle } from "lucide-react";
import { login } from "../lib/api";
import { saveSession } from "../lib/auth";

type LoginRole = "teacher" | "student" | "admin";

const DEMO_CREDENTIALS: Record<
  LoginRole,
  { email: string; password: string } | null
> = {
  teacher: { email: "dr.smith@smartschool.ai", password: "teacher123" },
  student: { email: "cedric@smartschool.ai", password: "student123" },
  admin: null, // no admin account seeded yet
};

const ROLE_HOME: Record<string, string> = {
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  admin: "/teacher/dashboard",
};

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<LoginRole>("teacher");
  const [email, setEmail] = useState(DEMO_CREDENTIALS.teacher!.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.teacher!.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectRole = (r: LoginRole) => {
    setRole(r);
    const demo = DEMO_CREDENTIALS[r];
    setEmail(demo?.email ?? "");
    setPassword(demo?.password ?? "");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(email, password);
      saveSession(
        result.access_token,
        result.role,
        result.name,
        result.user_id,
      );
      navigate(ROLE_HOME[result.role] ?? "/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
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

      <div className="flex flex-col items-center justify-center px-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back!</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Login to your account
          </p>

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <div className="relative mb-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Eye size={16} className="absolute right-3 top-3 text-slate-400" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg mb-6 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Login"}
          </button>

          <p className="text-center text-xs text-slate-400 mb-3">
            Login as (demo accounts)
          </p>
          <div className="grid grid-cols-3 gap-3">
            {(["teacher", "student", "admin"] as LoginRole[]).map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => selectRole(r)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium capitalize ${
                  role === r
                    ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                    : "border-slate-200 text-slate-500"
                }`}
              >
                <GraduationCap size={16} />
                {r}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
