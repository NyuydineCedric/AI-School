import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const questionNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const options = [
  { key: 'A', label: 'FCFS' },
  { key: 'B', label: 'Round Robin' },
  { key: 'C', label: 'Priority Scheduling' },
  { key: 'D', label: 'Binary Search' },
];

const QuizPage: React.FC = () => {
  const [current, setCurrent] = useState(3);
  // Sample data only has real question text for #3; other numbers just
  // demonstrate navigation + per-question answer tracking.
  const [answers, setAnswers] = useState<Record<number, string>>({
    1: 'A',
    2: 'B',
    3: 'D',
    4: 'C',
    6: 'A',
    7: 'B',
    8: 'D',
  });

  const answered = Object.keys(answers).map(Number);
  const selected = answers[current];

  const selectOption = (key: string) =>
    setAnswers((prev) => ({ ...prev, [current]: key }));

  const goTo = (n: number) => {
    if (n >= 1 && n <= questionNumbers.length) setCurrent(n);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg font-semibold text-slate-800">Operating Systems Quiz</h1>
          <div className="text-right">
            <p className="text-xs text-slate-400">Time Left</p>
            <p className="text-sm font-semibold text-rose-500">00:24:18</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Questions</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questionNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => goTo(n)}
                  className={`w-8 h-8 rounded-md text-xs font-medium flex items-center justify-center ${
                    n === current
                      ? 'bg-indigo-600 text-white'
                      : answered.includes(n)
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Current
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Not Answered
              </div>
            </div>
          </div>

          <div className="col-span-3 bg-white border border-slate-200 rounded-xl p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Question {current} (2 marks)</h3>
            <p className="text-sm text-slate-700 mb-6">
              {current === 3
                ? 'Which of the following is NOT a CPU scheduling algorithm?'
                : 'Sample question text goes here for this item.'}
            </p>
            <div className="space-y-3 flex-1">
              {options.map((o) => (
                <button
                  key={o.key}
                  onClick={() => selectOption(o.key)}
                  className={`w-full flex items-center gap-3 border rounded-lg px-4 py-3 text-sm text-left ${
                    selected === o.key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                      selected === o.key ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300'
                    }`}
                  >
                    {o.key}
                  </span>
                  {o.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => goTo(current - 1)}
                disabled={current === 1}
                className="flex items-center gap-1 text-sm text-slate-500 font-medium disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <button
                onClick={() => goTo(current + 1)}
                disabled={current === questionNumbers.length}
                className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-40"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
