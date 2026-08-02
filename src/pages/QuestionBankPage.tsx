import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Search, Plus, AlertCircle } from "lucide-react";
import { getQuestionBank, addQuestionBankItem, getCourses } from "../lib/api";

interface QBItem {
  id: string;
  course_name: string;
  text: string;
  difficulty: string;
}

const QuestionBankPage: React.FC = () => {
  const [items, setItems] = useState<QBItem[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");

  const [courseName, setCourseName] = useState("");
  const [text, setText] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getQuestionBank()
      .then(setItems)
      .catch(() => setItems([]));
    getCourses()
      .then((data) => {
        setCourses(data);
        if (data[0]) setCourseName(data[0].name);
      })
      .catch(() => setCourses([]));
  }, []);

  const filtered = items.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async () => {
    if (!text.trim() || !courseName) return;
    setSaving(true);
    setError(null);
    try {
      const item = await addQuestionBankItem(
        courseName,
        text.trim(),
        difficulty,
      );
      setItems((prev) => [item, ...prev]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="questionbank" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">
          Question Bank
        </h1>

        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">
            Add a question
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              {courses.length === 0 && <option value="">No courses yet</option>}
              {courses.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Question text..."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none h-20 mb-3"
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 mb-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <button
            onClick={handleAdd}
            disabled={saving || !text.trim() || !courseName}
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Plus size={14} /> {saving ? "Adding…" : "Add Question"}
          </button>
        </div>

        <div className="relative mb-4 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-2.5 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm outline-none"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-400">
              No questions yet.
            </p>
          )}
          {filtered.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="text-sm text-slate-700">{q.text}</p>
                <p className="text-xs text-slate-400 mt-1">{q.course_name}</p>
              </div>
              <span className="text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">
                {q.difficulty}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuestionBankPage;
