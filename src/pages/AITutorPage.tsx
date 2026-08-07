import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Bot,
  Send,
  User,
  AlertCircle,
  ImageIcon,
  Plus,
  FileText,
  Music,
  Video,
  File as FileIcon,
  X,
  Link as LinkIcon,
  Volume2,
  Square,
} from "lucide-react";
import { streamChatMessage, ChatMessage } from "../lib/api";

// Shown as a centered heading (like Claude's own welcome screen) when the
// conversation is empty - NOT injected into the messages array, and NOT
// sent to the backend as chat history.
const WELCOME_TITLE = "Hello! I'm your AI Tutor.";
const WELCOME_SUBTITLE =
  "Ask me anything about your courses, assignments, or concepts.";

const ACCEPTED_FILE_TYPES =
  "image/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv";

const MAX_FILE_SIZE_MB = 25;

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

interface UploadedAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  extractedText: string | null;
  truncated: boolean;
}

interface PendingFileAttachment {
  kind: "file";
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
  uploaded?: UploadedAttachment;
}

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PendingLinkAttachment {
  kind: "link";
  id: string;
  url: string;
  status: "done"; // links need no upload step
}

type PendingAttachment = PendingFileAttachment | PendingLinkAttachment;

// Uploads a single file to the backend's POST /ai/chat/upload route
// (see routers/ai.py), which accepts multipart/form-data and returns
// { id, name, url, type, size, extracted_text, truncated }.
async function uploadChatFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadedAttachment> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            id: data.id ?? crypto.randomUUID(),
            name: data.name ?? file.name,
            url: data.url,
            type: data.type ?? file.type,
            size: data.size ?? file.size,
            extractedText: data.extracted_text ?? null,
            truncated: Boolean(data.truncated),
          });
        } catch {
          reject(new Error("Malformed upload response."));
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status}).`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload.")),
    );

    xhr.open("POST", `${API_BASE_URL}/ai/chat/upload`);

    // The backend route is auth-protected (Depends(get_current_user)),
    // which expects a JWT from /auth/login stored under "ssai_token".
    const token = localStorage.getItem("ssai_token");

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.send(formData);
  });
}

function attachmentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <ImageIcon size={14} />;
  if (mimeType.startsWith("audio/")) return <Music size={14} />;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("text")
  )
    return <FileText size={14} />;
  return <FileIcon size={14} />;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const AITutorPage: React.FC = () => {
  // Starts empty - the greeting is no longer a message in this array.
  // See the "welcome heading" block in the render below.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  // Index of the assistant message currently being read aloud, if any.
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message whenever the message list changes
  // (new message sent/received) or the streaming/loading state changes.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    if (showLinkInput) {
      linkInputRef.current?.focus();
    }
  }, [showLinkInput]);

  // Stop any in-progress speech if the page unmounts.
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const isUploading = pendingAttachments.some(
    (a) => a.kind === "file" && a.status === "uploading",
  );

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file later

    if (files.length === 0) return;

    const tooLarge = files.filter(
      (f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );
    const acceptedFiles = files.filter(
      (f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024,
    );

    if (tooLarge.length > 0) {
      setError(
        `${tooLarge.map((f) => f.name).join(", ")} exceeded the ${MAX_FILE_SIZE_MB}MB limit and ${
          tooLarge.length === 1 ? "was" : "were"
        } skipped.`,
      );
    }

    const newEntries: PendingFileAttachment[] = acceptedFiles.map((file) => ({
      kind: "file",
      id: crypto.randomUUID(),
      file,
      status: "uploading",
      progress: 0,
    }));

    setPendingAttachments((prev) => [...prev, ...newEntries]);

    newEntries.forEach((entry) => {
      uploadChatFile(entry.file, (pct) => {
        setPendingAttachments((prev) =>
          prev.map((a) =>
            a.kind === "file" && a.id === entry.id
              ? { ...a, progress: pct }
              : a,
          ),
        );
      })
        .then((uploaded) => {
          setPendingAttachments((prev) =>
            prev.map((a) =>
              a.kind === "file" && a.id === entry.id
                ? { ...a, status: "done", uploaded, progress: 100 }
                : a,
            ),
          );
        })
        .catch((err) => {
          setPendingAttachments((prev) =>
            prev.map((a) =>
              a.kind === "file" && a.id === entry.id
                ? {
                    ...a,
                    status: "error",
                    error:
                      err instanceof Error ? err.message : "Upload failed.",
                  }
                : a,
            ),
          );
        });
    });
  };

  const handleAddLink = () => {
    const url = linkDraft.trim();
    if (!url) return;

    if (!URL_PATTERN.test(url)) {
      setError(
        "That doesn't look like a valid link (must start with http:// or https://).",
      );
      return;
    }

    const newEntry: PendingLinkAttachment = {
      kind: "link",
      id: crypto.randomUUID(),
      url,
      status: "done",
    };

    setPendingAttachments((prev) => [...prev, newEntry]);
    setLinkDraft("");
    setShowLinkInput(false);
    setError(null);
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkDraft("");
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Reads a given assistant message aloud, or stops playback if that
  // message is already being read.
  const handleToggleSpeech = (index: number, text: string) => {
    if (!("speechSynthesis" in window)) {
      setError("Speech playback isn't supported in this browser.");
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.cancel(); // stop whatever was playing before
    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  const handleSend = async () => {
    const text = input.trim();
    const readyFileAttachments = pendingAttachments.filter(
      (a): a is PendingFileAttachment =>
        a.kind === "file" && a.status === "done",
    );
    const linkAttachments = pendingAttachments.filter(
      (a): a is PendingLinkAttachment => a.kind === "link",
    );
    const hasReadyAttachments =
      readyFileAttachments.length > 0 || linkAttachments.length > 0;

    if ((!text && !hasReadyAttachments) || loading || isUploading) return;

    // Stop any speech that's currently playing - a new turn is starting.
    window.speechSynthesis?.cancel();
    setSpeakingIndex(null);

    // Fold each attachment's content/reference directly into the outgoing
    // message so the model actually has something to work with (the
    // backend LLM call only ever sees plain chat text, not files).
    const fileBlocks = readyFileAttachments
      .map((a) => {
        const att = a.uploaded!;
        if (att.extractedText) {
          const truncNote = att.truncated
            ? "\n[Note: this document was long and has been truncated.]"
            : "";
          return `\n\n--- Content from "${att.name}" ---\n${att.extractedText}${truncNote}\n--- End of "${att.name}" ---`;
        }
        // Images/audio: no text extraction available server-side, so at
        // least tell the model the file exists rather than staying silent.
        return `\n\n[Attached "${att.name}" (${att.type || "unknown type"}) - content could not be extracted as text.]`;
      })
      .join("");

    const linkBlocks = linkAttachments
      .map((a) => `\n\n[Video reference link: ${a.url}]`)
      .join("");

    const outgoingText = `${text}${fileBlocks}${linkBlocks}`.trim();

    const attachmentSummaries = [
      ...readyFileAttachments.map((a) => ({
        kind: "file" as const,
        name: a.uploaded!.name,
        type: a.uploaded!.type,
      })),
      ...linkAttachments.map((a) => ({
        kind: "link" as const,
        name: a.url,
      })),
    ];

    const historyForBackend: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: outgoingText,
        displayContent: text,
        attachments: attachmentSummaries,
        timestamp: new Date().toISOString(),
      },
    ];

    setMessages([
      ...historyForBackend,
      { role: "assistant", content: "", timestamp: new Date().toISOString() },
    ]);
    setInput("");
    setPendingAttachments([]);
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

  const canSend =
    (input.trim().length > 0 ||
      pendingAttachments.some(
        (a) => a.kind === "link" || a.status === "done",
      )) &&
    !loading &&
    !isUploading;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="student" active="aitutor" />
      <main className="flex-1 flex flex-col p-6">
        <h1 className="text-lg font-semibold text-slate-800 mb-4">AI Tutor</h1>

        <div
          ref={scrollRef}
          className="flex-1 bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
                <Bot size={28} className="text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                {WELCOME_TITLE}
              </h2>
              <p className="text-sm text-slate-500 max-w-sm">
                {WELCOME_SUBTITLE}
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isLast = i === messages.length - 1;
              const isStreamingPlaceholder =
                m.role === "assistant" && m.content === "" && loading && isLast;

              const isStreamingThisMessage =
                m.role === "assistant" && loading && isLast;
              const shownText = m.displayContent ?? m.content;
              const isSpeakingThis = speakingIndex === i;

              return m.role === "assistant" ? (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex flex-col items-start gap-1 max-w-md">
                    <div className="bg-slate-50 rounded-xl rounded-tl-none px-4 py-3 text-sm text-slate-700 whitespace-pre-wrap">
                      {isStreamingPlaceholder ? (
                        <span className="text-slate-400">Thinking...</span>
                      ) : (
                        <>
                          {m.content}
                          <div className="text-[10px] text-slate-400 mt-1">
                            {formatTime(m.timestamp)}
                          </div>
                        </>
                      )}
                    </div>

                    {!isStreamingPlaceholder &&
                      !isStreamingThisMessage &&
                      m.content && (
                        <button
                          onClick={() => handleToggleSpeech(i, m.content)}
                          title={isSpeakingThis ? "Stop reading" : "Read aloud"}
                          className="flex items-center gap-1 pl-1 text-slate-400 hover:text-indigo-600 transition"
                        >
                          {isSpeakingThis ? (
                            <Square size={14} />
                          ) : (
                            <Volume2 size={14} />
                          )}
                        </button>
                      )}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-start gap-3 justify-end">
                  <div className="max-w-md flex flex-col items-end gap-1.5">
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {m.attachments.map((att, ai2) =>
                          att.kind === "file" ? (
                            <div
                              key={ai2}
                              className="flex items-center gap-1.5 bg-indigo-500/90 text-white rounded-lg px-2.5 py-1.5 text-xs max-w-[200px]"
                            >
                              {attachmentIcon(att.type ?? "")}
                              <span className="truncate">{att.name}</span>
                            </div>
                          ) : (
                            <div
                              key={ai2}
                              className="flex items-center gap-1.5 bg-indigo-500/90 text-white rounded-lg px-2.5 py-1.5 text-xs max-w-[200px]"
                            >
                              <Video size={14} />
                              <span className="truncate">{att.name}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {shownText && (
                      <div className="bg-indigo-600 text-white rounded-xl rounded-tr-none px-4 py-3 text-sm whitespace-pre-wrap">
                        {shownText}
                        <div className="text-[10px] text-indigo-200 mt-1">
                          {formatTime(m.timestamp)}
                        </div>
                      </div>
                    )}
                    {!shownText && (
                      <div className="text-[10px] text-slate-400 px-1">
                        {formatTime(m.timestamp)}
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <User size={16} className="text-slate-500" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 mt-3">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {pendingAttachments.map((a) =>
              a.kind === "file" ? (
                <div
                  key={a.id}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-1.5 text-xs ${
                    a.status === "error"
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {attachmentIcon(a.file.type)}
                  <span className="max-w-[140px] truncate">{a.file.name}</span>
                  <span className="text-slate-400">
                    {formatBytes(a.file.size)}
                  </span>
                  {a.status === "uploading" && (
                    <span className="text-indigo-500">{a.progress}%</span>
                  )}
                  {a.status === "error" && <span>{a.error}</span>}
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={`Remove ${a.file.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div
                  key={a.id}
                  className="flex items-center gap-2 border border-indigo-200 bg-indigo-50 text-indigo-600 rounded-lg px-3 py-1.5 text-xs"
                >
                  <Video size={14} />
                  <span className="max-w-[220px] truncate">{a.url}</span>
                  <button
                    onClick={() => removeAttachment(a.id)}
                    className="text-indigo-400 hover:text-indigo-600"
                    aria-label="Remove video link"
                  >
                    <X size={13} />
                  </button>
                </div>
              ),
            )}
          </div>
        )}

        {showLinkInput && (
          <div className="flex items-center gap-2 mt-3">
            <LinkIcon size={15} className="text-slate-400 shrink-0" />
            <input
              ref={linkInputRef}
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Paste a YouTube or video link..."
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddLink}
              className="text-sm font-medium text-indigo-600 px-3 py-2 rounded-full hover:bg-indigo-50"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkDraft("");
              }}
              className="text-sm text-slate-400 px-2 py-2 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="mt-4 relative flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFilesSelected}
            className="hidden"
          />

          <div className="absolute left-1.5 flex items-center gap-0.5">
            <button
              onClick={handlePickFiles}
              disabled={loading}
              title="Attach documents, images, or audio"
              className="w-9 h-9 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-slate-50 flex items-center justify-center disabled:opacity-40"
            >
              <Plus size={17} />
            </button>
            <button
              onClick={() => setShowLinkInput((v) => !v)}
              disabled={loading}
              title="Add a video link (e.g. YouTube)"
              className={`w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40 ${
                showLinkInput
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <LinkIcon size={16} />
            </button>
          </div>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={loading}
            className="w-full border border-slate-200 rounded-full pl-24 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="absolute right-1.5 w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default AITutorPage;
