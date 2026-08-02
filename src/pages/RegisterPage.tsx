import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, AlertCircle } from "lucide-react";
import { register } from "../lib/api";
import { saveSession } from "../lib/auth";
import AuthIllustration from "../components/AuthIllustration";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email.trim(), password);
      saveSession(result.access_token, result.role, result.name, result.user_id);
      navigate("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50/60 relative overflow-hidden px-10">
        <div className="absolute top-10 left-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">Smart School AI</span>
        </div>
        <AuthIllustration />
      </div>

      <div className="flex flex-col items-center justify-center px-8">
        <form onSubmit={handleRegister} className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-900">
            Create your student account
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Teacher and admin accounts are set up by your school's admin.
          </p>

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 mb-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 mt-2 mb-4">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg mt-4 mb-6 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
