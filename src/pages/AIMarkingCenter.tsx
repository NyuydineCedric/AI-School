import React, { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { UploadCloud, AlertCircle } from "lucide-react";
import { streamChatMessage } from "../lib/api";

interface Submission {
  id: string;
  name: string;
  file: string;
  status: "Marked" | "Pending";
  score: string;
  text: string; // extracted submission text sent to the AI
  feedback?: string;
}

const initialSubmissions: Submission[] = [
  {
    id: "1",
    name: "Alex Morgan",
    file: "answer1.pdf",
    status: "Marked",
    score: "18 / 20",
    text: "",
  },
  {
    id: "2",
    name: "Samantha Lee",
    file: "answer2.pdf",
    status: "Marked",
    score: "17 / 20",
    text: "",
  },
  {
    id: "3",
    name: "Daniel Kim",
    file: "answer3.pdf",
    status: "Pending",
    score: "-",
    text: "",
  },
];

const AIMarkingCenter: React.FC = () => {
  const [detailedFeedback, setDetailedFeedback] = useState(true);
  const [checkPlagiarism, setCheckPlagiarism] = useState(true);
  const [maxMarks, setMaxMarks] = useState("20");
  const [rubric, setRubric] = useState("Default Rubric");

  const [submissions, setSubmissions] =
    useState<Submission[]>(initialSubmissions);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend expects plain text in the message, not a file — so for now we only
  // read .txt files directly in the browser. PDF/DOCX would need a text
  // extraction library (e.g. pdfjs-dist / mammoth) added on top of this.
  const handleFileSelected = async (file: File) => {
    setUploadError(null);
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setUploadError(
        `"${file.name}" isn't plain text. Only .txt is supported until PDF/DOCX text extraction is added.`,
      );
      return;
    }
    const text = await file.text();
    setSubmissions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.txt$/i, ""),
        file: file.name,
        status: "Pending",
        score: "-",
        text,
      },
    ]);
  };

  const handleMark = async (submission: Submission) => {
    setMarkingId(submission.id);
    setUploadError(null);

    const prompt = [
      `Mark this student submission out of ${maxMarks} marks using the "${rubric}" rubric.`,
      detailedFeedback
        ? "Provide detailed feedback explaining the score."
        : "Keep feedback brief.",
      checkPlagiarism
        ? "Also flag anything that looks copied or unoriginal."
        : "",
      `End your response with a line in exactly this format: "Score: X/${maxMarks}".`,
      `\n\nSubmission:\n${submission.text}`,
    ].join(" ");

    let fullText = "";
    try {
      await streamChatMessage([{ role: "user", content: prompt }], (chunk) => {
        fullText += chunk;
      });

      const match = fullText.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*\d+/i);
      const score = match ? `${match[1]} / ${maxMarks}` : "See feedback";

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? { ...s, status: "Marked", score, feedback: fullText }
            : s,
        ),
      );
      setOpenFeedbackId(submission.id);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to mark this submission.",
      );
    } finally {
      setMarkingId(null);
    }
  };

  const openSubmission = submissions.find((s) => s.id === openFeedbackId);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="aitutor" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800">
          AI Marking Center
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Upload student submissions for AI powered evaluation
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl w-full py-10 flex flex-col items-center text-center"
            >
              <UploadCloud size={28} className="text-indigo-400 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                Drag &amp; drop files here
              </p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
              <p className="text-[11px] text-slate-400 mt-3">
                .txt supported now &middot; PDF, DOCX, ZIP need extraction added
              </p>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Marking Settings
            </h3>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Rubric
            </label>
            <select
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
            >
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

            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Max Marks
            </label>
            <input
              value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {uploadError}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">
              Submissions
            </h3>
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
                        s.status === "Marked"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {markingId === s.id ? "Marking…" : s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.score}</td>
                  <td className="px-5 py-3">
                    <button
                      disabled={
                        markingId === s.id ||
                        (s.status === "Pending" && !s.text)
                      }
                      onClick={() =>
                        s.status === "Marked"
                          ? setOpenFeedbackId(s.id)
                          : handleMark(s)
                      }
                      className="text-indigo-600 text-xs font-medium disabled:opacity-40"
                    >
                      {s.status === "Marked" ? "View" : "Mark"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {openSubmission?.feedback && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Feedback — {openSubmission.name}
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {openSubmission.feedback}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIMarkingCenter;
