import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { UploadCloud } from 'lucide-react';
import { Student } from '../types';

const submissions: Student[] = [
  { id: '1', name: 'Alex Morgan', file: 'answer1.pdf', status: 'Marked', score: '18 / 20' },
  { id: '2', name: 'Samantha Lee', file: 'answer2.pdf', status: 'Marked', score: '17 / 20' },
  { id: '3', name: 'Daniel Kim', file: 'answer3.pdf', status: 'Pending', score: '-' },
];

const AIMarkingCenter: React.FC = () => {
  const [detailedFeedback, setDetailedFeedback] = useState(true);
  const [checkPlagiarism, setCheckPlagiarism] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="aitutor" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800">AI Marking Center</h1>
        <p className="text-sm text-slate-500 mb-5">
          Upload student submissions for AI powered evaluation
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-center">
            <div className="border-2 border-dashed border-slate-200 rounded-xl w-full py-10 flex flex-col items-center text-center">
              <UploadCloud size={28} className="text-indigo-400 mb-3" />
              <p className="text-sm font-medium text-slate-600">Drag &amp; drop files here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              <p className="text-[11px] text-slate-400 mt-3">PDF, DOCX, TXT, ZIP (100MB)</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Marking Settings</h3>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Rubric</label>
            <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Default Rubric</option>
              <option>Custom Rubric</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-600 mb-3">
              <input
                type="checkbox"
                checked={detailedFeedback}
                onChange={(e) => setDetailedFeedback(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Provide detailed feedback
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <input
                type="checkbox"
                checked={checkPlagiarism}
                onChange={(e) => setCheckPlagiarism(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Check for plagiarism
            </label>

            <label className="block text-xs font-medium text-slate-600 mb-1.5">Max Marks</label>
            <input
              defaultValue="20"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Submissions</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Student</th>
                <th className="text-left font-medium px-5 py-3">File</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Score</th>
                <th className="text-left font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{s.name}</td>
                  <td className="px-5 py-3 text-slate-500">{s.file}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-md ${
                        s.status === 'Marked'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.score}</td>
                  <td className="px-5 py-3">
                    <button className="text-indigo-600 text-xs font-medium">
                      {s.status === 'Marked' ? 'View' : 'Mark'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AIMarkingCenter;
