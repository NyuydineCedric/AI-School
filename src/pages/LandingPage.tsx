import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import HeroIllustration from "../components/HeroIllustration";

const stats = [
  { value: "500+", label: "Schools" },
  { value: "50K+", label: "Teachers" },
  { value: "500K+", label: "Students" },
  { value: "98%", label: "Satisfaction" },
];

const features = [
  {
    icon: Sparkles,
    title: "AI-generated questions",
    body: "Turn a topic into a ready-to-use quiz or exam in seconds, with an answer key included.",
  },
  {
    icon: ClipboardCheck,
    title: "Automatic marking",
    body: "Assignments, quizzes, and exams get scored instantly, freeing up hours of grading time.",
  },
  {
    icon: BarChart3,
    title: "Real-time insight",
    body: "Attendance, grades, and at-risk students surface automatically on every teacher dashboard.",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-10 h-16 border-b border-slate-200/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800">Smart School AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About Us</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/register"
            className="hidden sm:inline-block text-sm font-medium text-slate-600 px-3 py-2"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-10 py-20 max-w-7xl mx-auto">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-5">
            <Sparkles size={12} /> Now with an AI teaching assistant
          </span>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            AI-Powered <br /> School Management <br /> &amp; Learning Platform
          </h1>
          <p className="text-slate-500 mt-6 text-lg max-w-md">
            Empower teachers. Inspire students. Automate grading. Improve
            learning.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-3 rounded-lg"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-slate-300 text-slate-700 font-medium px-5 py-3 rounded-lg"
            >
              I already have an account
            </Link>
          </div>

          <div className="flex gap-10 mt-14">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <HeroIllustration />
      </section>

      {/* Features */}
      <section id="features" className="px-10 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Everything a modern classroom needs
          </h2>
          <p className="text-slate-500 mt-2">
            One platform for teaching, grading, and staying on top of every
            student.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 pb-20 max-w-7xl mx-auto">
        <div className="bg-indigo-600 rounded-3xl px-10 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Ready to bring AI into your classroom?
          </h2>
          <p className="text-indigo-100 mt-3 max-w-xl mx-auto">
            Students can sign up in seconds. Teacher and admin accounts are
            set up by your school's admin.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg mt-7"
          >
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
