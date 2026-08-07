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
  unread_count: number;
}
interface Msg {
  id: string;
  sender_id: string;
  text: string;
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
              {c.unread_count > 0 && (
  <span className="inline-flex items-center rounded-full bg-red-600 text-white text-xs px-2 py-0.5 mt-1">
    {c.unread_count} unread message{c.unread_count > 1 ? "s" : ""}
  </span>
)}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-sm text-slate-800">
            {active?.name ?? "Select a conversation"}
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender_id === myId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-xl text-sm ${m.sender_id === myId ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-50 text-slate-700 rounded-tl-none"}`}
                >
                  {m.text}
                </div>
              </div>
            ))}
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
