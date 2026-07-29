import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Sparkles } from 'lucide-react';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
    {children}
  </div>
);

const selectClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

const questions = [
  {
    q: '1. Which normal form eliminates partial dependency?',
    options: ['a) 1NF', 'b) 2NF', 'c) 3NF', 'd) BCNF'],
    answer: 'Answer: b) 2NF',
  },
  {
    q: '2. The primary purpose of normalization is to:',
    options: ['a) Increase redundancy', 'b) Reduce redundancy', 'c) Improve query speed', 'd) Decrease table size'],
    answer: 'Answer: b) Reduce redundancy',
  },
];

const AIQuestionGenerator: React.FC = () => {
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="aiassistant" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800">AI Question Generator</h1>
        <p className="text-sm text-slate-500 mb-5">Generate questions for your assessment</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <Field label="Course">
              <select className={selectClass}>
                <option>Database Systems</option>
                <option>Data Structures</option>
                <option>Operating Systems</option>
              </select>
            </Field>
            <Field label="Topic">
              <input defaultValue="Normalization in DBMS" className={selectClass} />
            </Field>
            <Field label="Question Type">
              <select className={selectClass}>
                <option>Multiple Choice (MCQ)</option>
                <option>True / False</option>
                <option>Short Answer</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select className={selectClass}>
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </Field>
            <Field label="Number of Questions">
              <input defaultValue="10" className={selectClass} />
            </Field>
            <Field label="Bloom's Taxonomy Level">
              <select className={selectClass}>
                <option>Apply</option>
                <option>Remember</option>
                <option>Understand</option>
                <option>Analyze</option>
              </select>
            </Field>

            <label className="flex items-center gap-2 text-sm text-slate-600 mb-5">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Include Answer Key
            </label>

            <button className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-medium py-2.5 rounded-lg">
              <Sparkles size={15} /> Generate Questions
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Generated Preview</h3>
            <div className="space-y-5 flex-1">
              {questions.map((q, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-slate-700 mb-2">{q.q}</p>
                  <div className="grid grid-cols-2 gap-y-1 text-sm text-slate-600 mb-1">
                    {q.options.map((o) => (
                      <span key={o}>{o}</span>
                    ))}
                  </div>
                  {includeAnswerKey && (
                    <p className="text-xs font-medium text-emerald-600">{q.answer}</p>
                  )}
                </div>
              ))}
            </div>
            <button className="w-full bg-violet-600 text-white font-medium py-2.5 rounded-lg mt-4">
              Add to Question Bank
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIQuestionGenerator;
