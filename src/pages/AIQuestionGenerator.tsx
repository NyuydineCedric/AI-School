import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Sparkles, AlertCircle } from "lucide-react";
import { streamChatMessage } from "../lib/api";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const selectClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

const AIQuestionGenerator: React.FC = () => {
  const [course, setCourse] = useState("Database Systems");
  const [topic, setTopic] = useState("Normalization in DBMS");
  const [questionType, setQuestionType] = useState("Multiple Choice (MCQ)");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState("10");
  const [taxonomy, setTaxonomy] = useState("Apply");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [preview, setPreview] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setPreview("");

    const prompt = [
      `Generate ${numQuestions} ${questionType} questions for the course "${course}"`,
      `on the topic "${topic}".`,
      `Difficulty: ${difficulty}. Bloom's Taxonomy level: ${taxonomy}.`,
      includeAnswerKey
        ? "Include the correct answer directly under each question."
        : "Do not include answers.",
    ].join(" ");

    try {
      await streamChatMessage([{ role: "user", content: prompt }], (chunk) => {
        setPreview((prev) => prev + chunk);
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="aiassistant" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800">
          AI Question Generator
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Generate questions for your assessment
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <Field label="Course">
              <select
                className={selectClass}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option>Database Systems</option>
                <option>Data Structures</option>
                <option>Operating Systems</option>
              </select>
            </Field>
            <Field label="Topic">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={selectClass}
              />
            </Field>
            <Field label="Question Type">
              <select
                className={selectClass}
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option>Multiple Choice (MCQ)</option>
                <option>True / False</option>
                <option>Short Answer</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                className={selectClass}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </Field>
            <Field label="Number of Questions">
              <input
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className={selectClass}
              />
            </Field>
            <Field label="Bloom's Taxonomy Level">
              <select
                className={selectClass}
                value={taxonomy}
                onChange={(e) => setTaxonomy(e.target.value)}
              >
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

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              <Sparkles size={15} />{" "}
              {generating ? "Generating…" : "Generate Questions"}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 mt-3">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Generated Preview
            </h3>
            <div className="flex-1 text-sm text-slate-700 whitespace-pre-wrap overflow-y-auto">
              {preview || (
                <span className="text-slate-400">
                  {generating
                    ? "Thinking…"
                    : "Fill in the form and click Generate Questions."}
                </span>
              )}
            </div>
            <button
              disabled={!preview}
              className="w-full bg-violet-600 text-white font-medium py-2.5 rounded-lg mt-4 disabled:opacity-50"
            >
              Add to Question Bank
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIQuestionGenerator;
