import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Bot,
  ListChecks,
  MessageCircle,
  Users,
  AlertCircle,
  X,
} from "lucide-react";
import { getAssignment, submitAssignment } from "../lib/api";
import { getToken } from "../lib/auth";

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<any>(null);
  const [work, setWork] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Tutor state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No assignment selected.");
      setLoading(false);
      return;
    }
    setLoading(true);
    getAssignment(id)
      .then((detail) => {
        setAssignment(detail);
        setWork(detail?.submission?.content ?? "");
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load assignment.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!assignment || !work.trim()) return;
    setSubmitting(true);
    try {
      await submitAssignment(assignment.id, work.trim());
      setAssignment({
        ...assignment,
        submission: {
          status: "Submitted",
          content: work.trim(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- AI Tutor functions ----
  const openChat = () => {
    setShowChat(true);
    // Optionally seed the conversation with assignment context
    if (assignment && chatMessages.length === 0) {
      setChatMessages([
        {
          role: "user",
          content: `I'm working on assignment: "${assignment.title}". Instructions: ${assignment.instructions}. Can you help me understand it?`,
        },
      ]);
    }
  };

  const closeChat = () => {
    setShowChat(false);
    // Optionally clear messages when closing
    // setChatMessages([]);
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const token = getToken();
    if (!token) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "You need to be logged in to use the AI tutor. Please log in and try again.",
        },
      ]);
      return;
    }

    // Add user message
    const userMsg = { role: "user", content: currentInput };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setCurrentInput("");
    setIsLoading(true);

    // Placeholder for assistant
    const assistantPlaceholder = { role: "assistant", content: "" };
    setChatMessages([...updatedMessages, assistantPlaceholder]);

    try {
      const response = await fetch("http://localhost:8000/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 ADD THE TOKEN
        },
        body: JSON.stringify({
          messages: updatedMessages,
          accent: "USA",
          temperature: 0.7,
        }),
      });

      // If 401, handle it specifically
      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let assistantReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantReply += chunk;
        // Update the assistant message with accumulated text
        setChatMessages((prev) => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last.role === "assistant") {
            last.content = assistantReply;
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error("AI error:", err);
      // Remove the placeholder and show an error message
      setChatMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[newMessages.length - 1].role === "assistant") {
          newMessages.pop();
        }
        return [
          ...newMessages,
          {
            role: "assistant",
            content:
              err instanceof Error
                ? err.message
                : "Sorry, I encountered an error. Please try again.",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="assignments" />
      <main className="flex-1 overflow-y-auto p-6">
        <Link
          to="/student/assignments"
          className="flex items-center gap-1 text-sm text-slate-500 mb-4 w-fit"
        >
          <ChevronLeft size={14} /> Back to Assignments
        </Link>

        {loading && (
          <p className="text-sm text-slate-400">Loading assignment…</p>
        )}

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
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-sm font-medium ${
                    assignment.submission?.status === "Submitted" ||
                    assignment.submission?.status === "Graded"
                      ? "text-emerald-600"
                      : "text-rose-500"
                  }`}
                >
                  {assignment.submission?.status ?? "Not Submitted"}
                  {assignment.submission?.status === "Graded" &&
                    assignment.submission?.grade !== undefined &&
                    ` — ${assignment.submission.grade}/${assignment.max_marks}`}
                </span>
              </div>

              <textarea
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="Type or paste your work here…"
                disabled={assignment.submission?.status === "Submitted" || assignment.submission?.status === "Graded"}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-32 mb-3 disabled:bg-slate-50 disabled:text-slate-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !work.trim() ||
                    assignment.submission?.status === "Submitted" ||
                    assignment.submission?.status === "Graded"
                  }
                  className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting…"
                    : assignment.submission?.status === "Submitted" ||
                        assignment.submission?.status === "Graded"
                      ? "Submitted"
                      : "Submit Assignment"}
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
                <button
                  onClick={openChat}
                  className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg"
                >
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

      {/* ---- AI Tutor Chat Modal ---- */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[600px] max-h-[80vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-slate-800">AI Tutor</h3>
              <button
                onClick={closeChat}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-slate-400 text-center">
                  Ask me anything about AI-related topics!
                </p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-block animate-pulse">▌</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-lg text-sm text-slate-500">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4 flex gap-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your question..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !currentInput.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentDetails;
