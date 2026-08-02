import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { createQuiz, getCourses, getQuizzes } from "../lib/api";

interface Quiz {
  id: string;
  title: string;
  course: string;
  questions: number;
  avg_score: string | null;
}

const TeacherQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState<any[]>([
    {
      text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      marks: 2,
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    getQuizzes()
      .then(setQuizzes)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load quizzes."),
      );
    getCourses()
      .then(setCourses)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load courses."),
      );
  };

  useEffect(() => {
    reload();
  }, []);

  const handleCreate = async () => {
    if (!courseId || !title.trim() || !questions.some((q) => q.text.trim()))
      return;
    setError(null);
    try {
      const created = await createQuiz(
        courseId,
        title.trim(),
        duration,
        questions.map((q) => ({ ...q, text: q.text.trim() })),
      );
      setQuizzes((prev) => [created, ...prev]);
      setTitle("");
      setDuration(30);
      setQuestions([
        {
          text: "",
          option_a: "",
          option_b: "",
          option_c: "",
          option_d: "",
          correct_option: "A",
          marks: 2,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish quiz.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="quizzes" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-5">Quizzes</h1>
        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quiz title"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>
          {questions.map((q, index) => (
            <div
              key={index}
              className="mt-4 border border-slate-200 rounded-lg p-3"
            >
              <input
                value={q.text}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, text: e.target.value }
                        : item,
                    ),
                  )
                }
                placeholder="Question"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none mb-2"
              />
              <div className="grid grid-cols-2 gap-2">
                {["option_a", "option_b", "option_c", "option_d"].map((key) => (
                  <input
                    key={key}
                    value={q[key]}
                    onChange={(e) =>
                      setQuestions((prev) =>
                        prev.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, [key]: e.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder={key.replace("option_", "Option ")}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={q.correct_option}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, correct_option: e.target.value }
                          : item,
                      ),
                    )
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) =>
                    setQuestions((prev) =>
                      prev.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, marks: Number(e.target.value) }
                          : item,
                      ),
                    )
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none w-20"
                />
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() =>
                setQuestions((prev) => [
                  ...prev,
                  {
                    text: "",
                    option_a: "",
                    option_b: "",
                    option_c: "",
                    option_d: "",
                    correct_option: "A",
                    marks: 2,
                  },
                ])
              }
              className="text-sm text-indigo-600"
            >
              + Add Question
            </button>
            <button
              onClick={handleCreate}
              className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Publish Quiz
            </button>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs">
                <th className="text-left font-medium px-5 py-3">Title</th>
                <th className="text-left font-medium px-5 py-3">Course</th>
                <th className="text-left font-medium px-5 py-3">Questions</th>
                <th className="text-left font-medium px-5 py-3">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{q.title}</td>
                  <td className="px-5 py-3 text-slate-600">{q.course}</td>
                  <td className="px-5 py-3 text-slate-600">{q.questions}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">
                    {q.avg_score ?? "-"}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      to={`/teacher/review?type=quizzes&id=${q.id}`}
                      className="text-sm text-indigo-600 font-medium"
                    >
                      Review
                    </Link>
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

export default TeacherQuizzesPage;
