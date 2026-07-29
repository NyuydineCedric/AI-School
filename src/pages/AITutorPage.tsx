import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bot, Send, User, AlertCircle } from "lucide-react";
import { streamChatMessage, ChatMessage } from "../lib/api";

const INTRO: ChatMessage = {
  role: "assistant",
  content:
    "Hello Cedric! I'm your AI Tutor. Ask me anything about your courses, assignments, or concepts.",
};

const AITutorPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // History sent to the backend excludes the placeholder assistant bubble
    // we're about to add for the streaming reply.
    const historyForBackend: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages([...historyForBackend, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      await streamChatMessage(historyForBackend, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      });
    } catch (err) {
      // Drop the empty placeholder bubble since nothing ever streamed into it.
      setMessages((prev) => prev.slice(0, -1));
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong talking to the AI Tutor.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="aitutor" />
      <main className="flex-1 flex flex-col p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-4">AI Tutor</h1>

        <div
          ref={scrollRef}
          className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 overflow-y-auto"
        >
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isStreamingPlaceholder =
              m.role === "assistant" && m.content === "" && loading && isLast;

            return m.role === "assistant" ? (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-indigo-600" />
                </div>
                <div className="bg-slate-50 rounded-xl rounded-tl-none px-4 py-3 max-w-md text-sm text-slate-700 whitespace-pre-wrap">
                  {isStreamingPlaceholder ? (
                    <span className="text-slate-400">Thinking…</span>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-3 justify-end">
                <div className="bg-indigo-600 text-white rounded-xl rounded-tr-none px-4 py-3 max-w-md text-sm whitespace-pre-wrap">
                  {m.content}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User size={16} className="text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mt-3">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="mt-4 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={loading}
            className="w-full border border-slate-200 rounded-full pl-5 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1.5 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default AITutorPage;
