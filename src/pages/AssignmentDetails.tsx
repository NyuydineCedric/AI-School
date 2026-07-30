import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  ChevronLeft,
  Bot,
  ListChecks,
  MessageCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import { getAssignments, getAssignment, submitAssignment } from "../lib/api";

const AssignmentDetails: React.FC = () => {
  const [assignment, setAssignment] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAssignments()
      .then(async (list) => {
        if (list[0]) {
          const detail = await getAssignment(list[0].id);
          setAssignment(detail);
        }
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load assignment.",
        ),
      );
  }, []);

  const handleSubmit = async () => {
    if (!assignment) return;
    setSubmitting(true);
    try {
      await submitAssignment(assignment.id, "Submitted via Smart School AI");
      setAssignment({
        ...assignment,
        submission: {
          status: "Submitted",
          content: "Submitted via Smart School AI",
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <a
          href="#"
          className="flex items-center gap-1 text-sm text-slate-500 mb-4"
        >
          <ChevronLeft size={14} /> Back to Assignments
        </a>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {assignment && (
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {assignment.title}
              </h2>
              <p className="text-xs text-slate-400 mb-1">Max Marks</p>
              <p className="text-sm font-medium text-slate-700 mb-6">
                {assignment.max_marks}
              </p>

              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Instructions
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {assignment.instructions}
              </p>

              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Your Submission
              </h3>
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${assignment.submission?.status === "Submitted" ? "text-emerald-600" : "text-rose-500"}`}
                >
                  {assignment.submission?.status ?? "Not Submitted"}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={
                    submitting || assignment.submission?.status === "Submitted"
                  }
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting…"
                    : assignment.submission?.status === "Submitted"
                      ? "Submitted"
                      : "Start Assignment"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Bot size={16} className="text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-800">
                    Ask AI for Help
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Need a hint or explanation?
                </p>
                <button className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg">
                  Ask AI Tutor
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <ListChecks size={15} className="text-slate-400" /> View
                    Rubric
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={15} className="text-slate-400" />{" "}
                    Discussion
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-slate-400" /> Ask Teacher
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignmentDetails;
