import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, PlayCircle } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Schools' },
  { value: '50K+', label: 'Teachers' },
  { value: '500K+', label: 'Students' },
  { value: '98%', label: 'Satisfaction' },
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
          <a href="#">Features</a>
          <a href="#">Solutions</a>
          <a href="#">Pricing</a>
          <a href="#">About Us</a>
        </nav>
        <Link
          to="/login"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Get Started
        </Link>
      </header>

      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-10 py-20 max-w-7xl mx-auto">
        <div>
          <h1 className="text-5xl font-bold text-slate-900 leading-tight">
            AI-Powered <br /> School Management <br /> &amp; Learning Platform
          </h1>
          <p className="text-slate-500 mt-6 text-lg max-w-md">
            Empower teachers. Inspire students. Automate grading. Improve learning.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <Link
              to="/login"
              className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-5 py-3 rounded-lg"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <button className="flex items-center gap-2 border border-slate-300 text-slate-700 font-medium px-5 py-3 rounded-lg">
              <PlayCircle size={16} /> Book a Demo
            </button>
          </div>

          <div className="flex gap-10 mt-14">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <p className="text-xs text-slate-400 mb-3">Trusted by schools around the world</p>
            <div className="flex gap-6">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-slate-200" />
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard mockup illustration */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 bg-indigo-50 rounded-lg h-32 flex items-end p-3 gap-2">
                {[40, 70, 55, 90, 60, 75].map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-indigo-500 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="bg-emerald-50 rounded-lg h-32 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-4 border-emerald-400 border-t-transparent" />
              </div>
              <div className="col-span-3 grid grid-cols-3 gap-3">
                <div className="bg-slate-50 rounded-lg h-16" />
                <div className="bg-slate-50 rounded-lg h-16" />
                <div className="bg-slate-50 rounded-lg h-16" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
