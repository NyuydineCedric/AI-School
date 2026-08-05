import React, { useState, useRef, useEffect } from "react";
import { Send, Download, Sparkles, AlertCircle, Loader } from "lucide-react";
import { streamChatMessage, fetchGeneratedDocument } from "../lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIDocumentChatBoxProps {
  courseName: string;
  onDocumentDownload?: (filename: string) => void;
}

const AIDocumentChatBox: React.FC<AIDocumentChatBoxProps> = ({
  courseName,
  onDocumentDownload,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);
    setError(null);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await streamChatMessage(
        updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content += chunk;
            return updated;
          });
        }
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get AI response"
      );
      setMessages((prev) => prev.slice(0, -1)); // Remove failed message
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (format: "pdf" | "docx") => {
    if (!messages.some((m) => m.role === "assistant")) {
      setError("Generate a document first by chatting with AI");
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");
      const userContext = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ");

      const { blob, filename } = await fetchGeneratedDocument({
        course_name: courseName,
        topic: userContext,
        format,
        title: `${courseName} - AI Generated Document`,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onDocumentDownload) {
        onDocumentDownload(filename);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to download ${format.toUpperCase()}`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-indigo-600" />
          <h3 className="font-semibold text-slate-800">AI Document Generator</h3>
        </div>
        <p className="text-xs text-slate-500">
          Chat with AI to generate and customize documents for your course
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-slate-400 text-center">
              Start chatting to generate a document for <br />
              <span className="font-medium text-slate-600">{courseName}</span>
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-800 px-3 py-2 rounded-lg rounded-bl-none text-sm">
              <div className="flex items-center gap-1">
                <Loader size={14} className="animate-spin" />
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-100">
          <div className="flex items-center gap-2 text-sm text-rose-600">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Download buttons */}
      {messages.some((m) => m.role === "assistant") && (
        <div className="border-t border-slate-200 px-4 py-3 bg-slate-50 flex gap-2">
          <button
            onClick={() => handleDownloadDocument("pdf")}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            <Download size={14} />
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
          <button
            onClick={() => handleDownloadDocument("docx")}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
          >
            <Download size={14} />
            {downloading ? "Downloading..." : "Download DOCX"}
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 p-3 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask AI to generate a document..."
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none disabled:bg-slate-50 focus:border-indigo-300"
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            className="bg-indigo-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700 transition"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentChatBox;
