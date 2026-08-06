import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Send } from "lucide-react";
import { Role } from "../types";
import { getConversations, getMessages, sendMessage } from "../lib/api";
import { getUserId } from "../lib/auth";

interface Conversation {
  id: string;
  name: string;
  last_message: string;
}
interface Msg {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Returns a stable key for grouping by calendar day, e.g. "2026-08-06".
// Using this (rather than the raw timestamp) is what lets us detect
// "different day" without worrying about hours/minutes/seconds.
function dayKey(isoString?: string): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toDateString();
}

// WhatsApp-style label: "Today", "Yesterday", or a full date.
function formatDateLabel(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

const MessagesPage: React.FC<{ role: Role }> = ({ role }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const myId = getUserId();

  useEffect(() => {
    getConversations().then((convos) => {
      setConversations(convos);
      if (convos[0]) setActiveId(convos[0].id);
    });
  }, []);

  useEffect(() => {
    if (activeId) getMessages(activeId).then(setMessages);
  }, [activeId]);

  const send = async () => {
    if (!draft.trim() || !activeId) return;
    const msg = await sendMessage(activeId, draft.trim());
    setMessages((prev) => [...prev, msg]);
    setDraft("");
  };

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="messages" />
      <main className="flex-1 p-6 flex gap-4 overflow-hidden">
        <div className="w-72 bg-white border border-slate-200 rounded-xl overflow-y-auto shrink-0">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 ${c.id === activeId ? "bg-indigo-50" : ""}`}
            >
              <p className="text-sm font-medium text-slate-800">{c.name}</p>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {c.last_message}
              </p>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-sm text-slate-800">
            {active?.name ?? "Select a conversation"}
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
            {messages.map((m, i) => {
              const prev = messages[i - 1];
              const showDateSeparator =
                dayKey(m.created_at) !== dayKey(prev?.created_at);

              return (
                <React.Fragment key={m.id}>
                  {showDateSeparator && (
                    <div className="flex justify-center my-2">
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {formatDateLabel(m.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex flex-col ${m.sender_id === myId ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                        m.sender_id === myId
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-slate-50 text-slate-700 rounded-tl-none"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={send}
              className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
