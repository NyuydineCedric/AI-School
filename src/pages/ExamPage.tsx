import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { AlertCircle } from "lucide-react";
import { getExams, getExam, saveExamAnswer } from "../lib/api";

const ExamPage: React.FC = () => {
  const [exam, setExam] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getExams()
      .then(async (list) => {
        if (!list[0]) return setError("No exams scheduled yet.");
        const full = await getExam(list[0].id);
        setExam(full);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load exam."),
      );
  }, []);

  const handleSave = async () => {
    if (!exam) return;
    await saveExamAnswer(exam.id, answer);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={15} /> {error}
        </main>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar role="student" active="exams" />
        <main className="flex-1 p-6 text-sm text-slate-400">Loading exam…</main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="exams" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-5">
          {exam.title}
        </h1>

        <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-3xl">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-indigo-700 mb-2">
              Exam Instructions
            </p>
            <p className="text-xs text-indigo-600 whitespace-pre-wrap">
              {exam.instructions}
            </p>
          </div>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-48 border border-slate-200 rounded-lg p-3 text-sm outline-none resize-none"
          />

          <div className="flex items-center justify-between mt-5">
            <p className="text-xs text-slate-400">
              {saved ? "Saved ✓" : "Not saved yet"}
            </p>
            <button
              onClick={handleSave}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Save Answer
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPage;
