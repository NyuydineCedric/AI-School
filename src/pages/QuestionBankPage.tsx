import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Search, Plus } from "lucide-react";
import { getQuestionBank, addQuestionBankItem } from "../lib/api";

interface QBItem {
  id: string;
  course_name: string;
  text: string;
  difficulty: string;
}

const QuestionBankPage: React.FC = () => {
  const [items, setItems] = useState<QBItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getQuestionBank()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const filtered = items.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()),
  );

  const addSample = async () => {
    const item = await addQuestionBankItem(
      "Database Systems",
      "New question — edit me",
      "Medium",
    );
    setItems((prev) => [item, ...prev]);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="questionbank" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-slate-800">
            Question Bank
          </h1>
          <button
            onClick={addSample}
            className="flex items-center gap-1 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus size={14} /> Add Question
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
