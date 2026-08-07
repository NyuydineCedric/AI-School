import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getGrades, streamChatMessage } from "../lib/api";

interface GradeRow {
  course: string;
  grade: string;
  score: string;
  credits: number;
}
interface GradesResponse {
  rows: GradeRow[];
  overall_gpa: number;
  total_courses: number;
  total_credits: number;
}

const gradeColor: Record<string, string> = {
  A: "text-emerald-600",
  "A-": "text-emerald-600",
  "B+": "text-indigo-600",
  B: "text-amber-600",
};

const GradesPage: React.FC = () => {
  const [data, setData] = useState<GradesResponse | null>(null);

  const [advice, setAdvice] = useState<string>("");
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);
  const [adviceOpen, setAdviceOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    getGrades()
      .then(setData)
      .catch(() =>
        setData({
          rows: [],
          overall_gpa: 0,
          total_courses: 0,
          total_credits: 0,
        }),
      );
  }, []);

  // Lock background scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = adviceOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [adviceOpen]);

  // Stop any speech if the modal closes or the component unmounts
  useEffect(() => {
    if (!adviceOpen) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [adviceOpen]);

  const buildPrompt = (d: GradesResponse) => {
    const courseLines = d.rows
      .map(
        (r) =>
          `- ${r.course}: grade ${r.grade} (score ${r.score}, ${r.credits} credits)`,
      )
      .join("\n");

    return `Here is my current academic record:

Overall GPA: ${d.overall_gpa}
Total courses: ${d.total_courses}
Total credits: ${d.total_credits}

Course breakdown:
${courseLines || "(no courses recorded yet)"}

Based on these grades, please advise me on a suitable career path. Point out subjects I seem strongest in, subjects that might need more attention, and suggest 2-3 career directions that fit my academic strengths, along with a short reason for each.`;
  };

  const handleCareerAdvice = async () => {
    if (!data || data.rows.length === 0) {
      setAdviceError("No grades available yet to base advice on.");
      setAdviceOpen(true);
      return;
    }

    setAdviceOpen(true);
    setAdviceLoading(true);
    setAdviceError(null);
    setAdvice("");

    try {
      await streamChatMessage(
        [{ role: "user", content: buildPrompt(data) }],
        (chunk) => setAdvice((prev) => prev + chunk),
        { accent: "USA", temperature: 0.7 },
      );
    } catch (err) {
      setAdviceError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setAdviceLoading(false);
    }
  };

  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window)) {
      setAdviceError("Speech playback isn't supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!advice.trim()) return;

    const utterance = new SpeechSynthesisUtterance(advice);
    utterance.rate = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // clear any queued speech first
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const closeModal = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setAdviceOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="grades" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">My Grades</h1>

        {data && (
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Overall GPA</p>
              <p className="text-2xl font-semibold text-indigo-600 mt-1">
                {data.overall_gpa}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Courses</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">
                {data.total_courses}
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">Total Credits</p>
              <p className="text-2xl font-semibold text-slate-800 mt-1">
                {data.total_credits}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Grade</th>
                <th className="text-left font-medium px-5 py-3">Score</th>
                <th className="text-left font-medium px-5 py-3">Credits</th>
              </tr>
            </thead>
            <tbody>
              {data?.rows.map((r) => (
                <tr key={r.course} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{r.course}</td>
                  <td
                    className={`px-5 py-3 font-semibold ${gradeColor[r.grade] ?? "text-slate-700"}`}
                  >
                    {r.grade}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.score}</td>
                  <td className="px-5 py-3 text-slate-600">{r.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleCareerAdvice}
            disabled={adviceLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {adviceLoading ? "Thinking..." : "Advise me on my career path"}
          </button>
        </div>
      </main>

      {adviceOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Career Path Advice
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto">
              {adviceError && (
                <p className="text-sm text-red-600">{adviceError}</p>
              )}
              {!adviceError && (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {advice || (adviceLoading ? "Generating advice..." : "")}
                </p>
              )}
            </div>

            {!adviceError && advice && (
              <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleToggleSpeech}
                  disabled={adviceLoading}
                  title={isSpeaking ? "Stop reading" : "Read aloud"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSpeaking ? (
                    <>
                      {/* stop icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="1.5" />
                      </svg>
                      Stop
                    </>
                  ) : (
                    <>
                      {/* volume/speaker icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                      </svg>
                      Listen
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesPage;
