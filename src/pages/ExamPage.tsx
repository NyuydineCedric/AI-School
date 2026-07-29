import React from 'react';
import Sidebar from '../components/Sidebar';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, ChevronRight } from 'lucide-react';

const ExamPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="exams" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-slate-800">Database Systems Midterm Exam</h1>
          <div className="text-right">
            <p className="text-xs text-slate-400">Time Left</p>
            <p className="text-sm font-semibold text-rose-500">01:59:45</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-700 mb-2">Exam Instructions</p>
            <ul className="text-xs text-indigo-600 space-y-1 list-disc list-inside">
              <li>This is a closed book exam.</li>
              <li>Do not switch tabs or open other applications.</li>
              <li>The exam will auto-submit when time ends.</li>
              <li>Ensure a stable internet connection.</li>
            </ul>
          </div>

          <p className="text-xs font-semibold text-slate-500 mb-4">Section A (20 marks)</p>

          <p className="text-sm font-semibold text-slate-700 mb-3">
            Question 1 (5 marks)
          </p>
          <p className="text-sm text-slate-600 mb-4">
            Explain the difference between SQL and NoSQL databases with examples.
          </p>

          <div className="border border-slate-200 rounded-lg">
            <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-200 text-slate-400">
              <Bold size={14} />
              <Italic size={14} />
              <Underline size={14} />
              <List size={14} />
              <ListOrdered size={14} />
              <AlignLeft size={14} />
            </div>
            <textarea
              placeholder="Type your answer here..."
              className="w-full h-40 p-3 text-sm outline-none resize-none rounded-b-lg"
            />
          </div>

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400">Auto-save: On</p>
            <button className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Next Section <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
