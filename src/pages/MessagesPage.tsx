import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Send } from "lucide-react";
import { Role } from "../types";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  unread: number;
  messages: { fromMe: boolean; text: string }[];
}

const seedConversations: Conversation[] = [
  {
    id: "1",
    name: "Dr. Smith",
    lastMessage: "Please resubmit question 3",
    unread: 2,
    messages: [
      {
        fromMe: false,
        text: "Please resubmit question 3, the logic has an edge case bug.",
      },
      { fromMe: true, text: "Sure, I will fix it tonight." },
    ],
  },
  {
    id: "2",
    name: "Dr. Johnson",
    lastMessage: "Great work on the quiz!",
    unread: 0,
    messages: [{ fromMe: false, text: "Great work on the quiz! Keep it up." }],
  },
  {
    id: "3",
    name: "Class Group",
    lastMessage: "Anyone free to study tonight?",
    unread: 1,
    messages: [{ fromMe: false, text: "Anyone free to study tonight?" }],
  },
];

const MessagesPage: React.FC<{ role: Role }> = ({ role }) => {
  const [conversations, setConversations] = useState(seedConversations);
  const [activeId, setActiveId] = useState(seedConversations[0].id);
  const [draft, setDraft] = useState("");

  const active = conversations.find((c) => c.id === activeId)!;

  const send = () => {
    if (!draft.trim()) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, { fromMe: true, text: draft }] }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role={role} active="messages" />
      <main className="flex-1 p-6 flex gap-4 overflow-hidden">
        <div className="w-72 bg-white border border-slate-200 rounded-xl overflow-y-auto shrink-0">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 ${
                c.id === activeId ? "bg-indigo-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">{c.name}</p>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {c.lastMessage}
              </p>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-sm text-slate-800">
            {active.name}
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {active.messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                    m.fromMe
                      ? "bg-indigo-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-700 rounded-tl-none"
                  }`}
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
