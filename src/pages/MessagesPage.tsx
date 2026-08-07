import React, { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Send,
  Search,
  ChevronLeft,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Role } from "../types";
import { getConversations, getMessages, sendMessage } from "../lib/api";
import { getUserId } from "../lib/auth";

interface Conversation {
  id: string;
  name: string;
  last_message: string;
  unread_count: number;
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

// Deterministic initials + color per conversation, so the same person
// always gets the same avatar — a lightweight stand-in for profile photos.
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-rose-500",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const MessagesPage: React.FC<{ role: Role }> = ({ role }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const myId = getUserId();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations()
      .then((convos) => {
        setConversations(convos);
        if (convos[0]) setActiveId(convos[0].id);
      })
      .finally(() => setConversationsLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setMessagesLoading(true);
    getMessages(activeId)
      .then(setMessages)
      .finally(() => setMessagesLoading(false));
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, messagesLoading]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeId || sending) return;
    setDraft("");
    setSending(true);
    try {
      const msg = await sendMessage(activeId, text);
      setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, last_message: text } : c)),
      );
    } finally {
      setSending(false);
    }
  };

  const active = conversations.find((c) => c.id === activeId);

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

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

        {/* Chat panel — full width on mobile once a chat is open, flexes
            alongside the list from md up. */}
        <div
          className={`${
            activeId ? "flex" : "hidden md:flex"
          } flex-1 bg-white border border-slate-200 rounded-xl flex-col min-w-0`}
        >
          {active ? (
            <>
              <div className="px-4 md:px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="md:hidden -ml-1 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 shrink-0"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft size={18} />
                </button>
                <div
                  className={`w-8 h-8 rounded-full ${avatarColor(
                    active.name,
                  )} text-white text-[11px] font-semibold flex items-center justify-center shrink-0`}
                >
                  {initials(active.name)}
                </div>
                <span className="font-semibold text-sm text-slate-800 truncate">
                  {active.name}
                </span>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-1 no-scrollbar"
              >
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2
                      size={18}
                      className="animate-spin text-slate-300"
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <MessageSquare size={22} className="text-slate-300" />
                    <p className="text-sm text-slate-400">
                      No messages yet — say hello to {active.name.split(" ")[0]}
                      .
                    </p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const prev = messages[i - 1];
                    const next = messages[i + 1];
                    const showDateSeparator =
                      dayKey(m.created_at) !== dayKey(prev?.created_at);
                    const isMine = m.sender_id === myId;
                    // Tighten the gap between consecutive messages from the
                    // same sender on the same day, like a real chat client.
                    const groupedWithNext =
                      next?.sender_id === m.sender_id &&
                      dayKey(next?.created_at) === dayKey(m.created_at);

                    return (
                      <React.Fragment key={m.id}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4 first:mt-0">
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                              {formatDateLabel(m.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${
                            groupedWithNext ? "mb-0.5" : "mb-2.5"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-xs px-4 py-2 text-sm leading-relaxed ${
                              isMine
                                ? "bg-indigo-600 text-white rounded-2xl rounded-tr-md"
                                : "bg-slate-100 text-slate-700 rounded-2xl rounded-tl-md"
                            }`}
                          >
                            {m.text}
                          </div>
                          {!groupedWithNext && (
                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                              {formatTime(m.created_at)}
                            </span>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
                />
                <button
                  onClick={send}
                  disabled={!draft.trim() || sending}
                  className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
                  aria-label="Send message"
                >
                  {sending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <MessageSquare size={20} className="text-indigo-600" />
              </div>
              <p className="text-sm text-slate-500">
                {conversationsLoading
                  ? "Loading conversations…"
                  : "Select a conversation to start messaging."}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
