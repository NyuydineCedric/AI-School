import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Sparkles,
  AlertCircle,
  Check,
  Plus,
  FileText,
  Video,
  Image,
  Download,
  Trash2,
} from "lucide-react";
import {
  streamChatMessage,
  addQuestionBankItem,
  fetchGeneratedDocument,
  convertUploadToDocxFile,
} from "../lib/api";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-600 mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const selectClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white";

type AttachmentType = "image" | "video" | "document" | "clipboard";

type Attachment = {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  mime: string;
  file?: File;
};

type GeneratedDoc = {
  id: string;
  filename: string;
  format: "pdf" | "docx";
  url: string;
};

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const AIQuestionGenerator: React.FC = () => {
  const [course, setCourse] = useState("Database Systems");
  const [topic, setTopic] = useState("Normalization in DBMS");
  const [questionType, setQuestionType] = useState("Multiple Choice (MCQ)");
  const [difficulty, setDifficulty] = useState("Medium");
  const [numQuestions, setNumQuestions] = useState("10");
  const [taxonomy, setTaxonomy] = useState("Apply");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [messageInput, setMessageInput] = useState("");

  const [preview, setPreview] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<
    string | null
  >(null);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedAttachment = attachments.find(
    (attachment) => attachment.id === selectedAttachmentId,
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        showAttachmentMenu &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowAttachmentMenu(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [showAttachmentMenu]);

  const handlePaste = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) => {
    const items = Array.from(event.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        const url = URL.createObjectURL(file);
        const attachment: Attachment = {
          id: generateId(),
          type: "clipboard",
          name: `clipboard-${Date.now()}.png`,
          url,
          mime: file.type,
          file,
        };
        setAttachments((prev) => [attachment, ...prev]);
        setSelectedAttachmentId(attachment.id);
      }
    }
  };

  const handleAttachmentOption = (type: AttachmentType) => {
    if (!attachmentInputRef.current) return;
    if (type === "image") {
      attachmentInputRef.current.accept = "image/*";
    } else if (type === "video") {
      attachmentInputRef.current.accept = "video/*";
    } else {
      attachmentInputRef.current.accept = ".txt,.pdf,.docx";
    }
    setShowAttachmentMenu(false);
    attachmentInputRef.current.click();
  };

  const handleAttachmentSelected = async (file: File) => {
    const mime = file.type || "application/octet-stream";
    const url = URL.createObjectURL(file);
    const type: AttachmentType = mime.startsWith("image/")
      ? "image"
      : mime.startsWith("video/")
        ? "video"
        : "document";

    const attachment: Attachment = {
      id: generateId(),
      type,
      name: file.name,
      url,
      mime,
      file,
    };

    setAttachments((prev) => [attachment, ...prev]);
    setSelectedAttachmentId(attachment.id);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setPreview("");

    const promptParts = [
      `Generate ${numQuestions} ${questionType} questions for the course "${course}" on the topic "${topic}".`,
      `Difficulty: ${difficulty}. Bloom's Taxonomy level: ${taxonomy}.`,
      includeAnswerKey
        ? "Include the correct answer directly under each question."
        : "Do not include answers.",
    ];

    if (messageInput.trim()) {
      promptParts.push(`Additional instruction: ${messageInput.trim()}`);
    }

    const prompt = promptParts.join(" ");

    try {
      await streamChatMessage([{ role: "user", content: prompt }], (chunk) => {
        setPreview((prev) => prev + chunk);
      });
      setMessageInput("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate questions.",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToBank = async () => {
    if (!preview.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addQuestionBankItem(course, preview.trim(), difficulty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save to question bank.",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleScreenshot = async () => {
    if (!containerRef.current) return;
    setError(null);
    setDownloadLoading(true);
    try {
      const canvas = await html2canvas(containerRef.current);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Screenshot capture failed.");
      const url = URL.createObjectURL(blob);
      const attachment: Attachment = {
        id: generateId(),
        type: "image",
        name: `screenshot-${Date.now()}.png`,
        url,
        mime: "image/png",
        file: undefined,
      };
      setAttachments((prev) => [attachment, ...prev]);
      setSelectedAttachmentId(attachment.id);
      setScreenshotUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to take screenshot.",
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadScreenshot = () => {
    if (!screenshotUrl) return;
    const a = document.createElement("a");
    a.href = screenshotUrl;
    a.download = `ai-screenshot-${Date.now()}.png`;
    a.click();
  };

  const handleGenerateDocument = async (format: "pdf" | "docx") => {
    if (!preview.trim()) return;
    setDownloadLoading(true);
    setError(null);
    try {
      const { blob, filename } = await fetchGeneratedDocument({
        course_name: course,
        topic,
        format,
        title: `${course}${topic ? " - " + topic : ""}`,
      });
      const url = URL.createObjectURL(blob);
      setGeneratedDocs((prev) => [
        { id: generateId(), filename, format, url },
        ...prev,
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate document.",
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadGeneratedDoc = (doc: GeneratedDoc) => {
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.filename;
    a.click();
  };

  const handleConvertToDocx = async () => {
    if (!selectedAttachment?.file) {
      setError("Select a document attachment to convert.");
      return;
    }
    setConverting(true);
    setError(null);
    try {
      await convertUploadToDocxFile(selectedAttachment.file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to convert file to Word.",
      );
    } finally {
      setConverting(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
    if (selectedAttachmentId === id) setSelectedAttachmentId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar role="teacher" active="aiassistant" />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-slate-800">
          AI Teacher Chat
        </h1>
        <p className="text-sm text-slate-500 mb-5">
          Use the chat attachment toolbar to paste screenshots, add files, and
          generate documents.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <Field label="Course">
              <select
                className={selectClass}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option>Database Systems</option>
                <option>Data Structures</option>
                <option>Operating Systems</option>
              </select>
            </Field>
            <Field label="Topic">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={selectClass}
              />
            </Field>
            <Field label="Question Type">
              <select
                className={selectClass}
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option>Multiple Choice (MCQ)</option>
                <option>True / False</option>
                <option>Short Answer</option>
              </select>
            </Field>
            <Field label="Difficulty">
              <select
                className={selectClass}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Medium</option>
                <option>Easy</option>
                <option>Hard</option>
              </select>
            </Field>
            <Field label="Number of Questions">
              <input
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className={selectClass}
              />
            </Field>
            <Field label="Bloom's Taxonomy Level">
              <select
                className={selectClass}
                value={taxonomy}
                onChange={(e) => setTaxonomy(e.target.value)}
              >
                <option>Apply</option>
                <option>Remember</option>
                <option>Understand</option>
                <option>Analyze</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-slate-600 mb-5">
              <input
                type="checkbox"
                checked={includeAnswerKey}
                onChange={(e) => setIncludeAnswerKey(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              Include Answer Key
            </label>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
            >
              <Sparkles size={15} /> {generating ? "Generating…" : "Send to AI"}
            </button>
            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-600 mt-3">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>

          <div
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col"
            ref={containerRef}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  Teacher AI Chat
                </h3>
                <p className="text-xs text-slate-500">
                  Paste an image or attach a file to include it in the chat.
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAttachmentMenu((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} /> Attach
                </button>
                {showAttachmentMenu && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => handleAttachmentOption("image")}
                    >
                      <Image size={16} /> Add picture
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => handleAttachmentOption("video")}
                    >
                      <Video size={16} /> Add video
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => handleAttachmentOption("document")}
                    >
                      <FileText size={16} /> Add document
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[260px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {preview ? (
                preview
              ) : (
                <span className="text-slate-400">
                  {generating
                    ? "AI is preparing the response..."
                    : "Your AI response will appear here after sending."}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAttachmentMenu((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={16} /> Attach
                </button>
                <span className="text-xs text-slate-500">
                  Paste an image into the chat box or attach a file.
                </span>
              </div>
              <textarea
                ref={chatInputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onPaste={handlePaste}
                placeholder="Type a message or paste an image..."
                className="mt-3 h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => handleGenerateDocument("pdf")}
                    disabled={!preview || generating || downloadLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    Generate PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateDocument("docx")}
                    disabled={!preview || generating || downloadLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Generate Word
                  </button>
                  <button
                    type="button"
                    onClick={handleScreenshot}
                    disabled={!preview || generating || downloadLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    Take Screenshot
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !messageInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Attachments
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select a file to preview and convert.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {attachments.length} items
                </span>
              </div>
              {attachments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 text-center">
                  No attachments yet. Use the Attach button or paste an image.
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className={`group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
                        selectedAttachmentId === attachment.id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 bg-white"
                      }`}
                      onClick={() => setSelectedAttachmentId(attachment.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          {attachment.type === "image" ||
                          attachment.type === "clipboard" ? (
                            <Image size={18} />
                          ) : attachment.type === "video" ? (
                            <Video size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {attachment.type === "document"
                              ? attachment.mime
                              : attachment.type === "video"
                                ? "Video attachment"
                                : "Image attachment"}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAttachment(attachment.id);
                        }}
                        className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {selectedAttachment ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-800">
                        Selected attachment
                      </h5>
                      <p className="text-xs text-slate-500">
                        {selectedAttachment.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachmentId(null)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                  {selectedAttachment.type === "image" ||
                  selectedAttachment.type === "clipboard" ? (
                    <img
                      src={selectedAttachment.url}
                      alt={selectedAttachment.name}
                      className="max-h-52 w-full rounded-2xl object-contain"
                    />
                  ) : selectedAttachment.type === "video" ? (
                    <video
                      controls
                      src={selectedAttachment.url}
                      className="w-full rounded-2xl"
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
                      Document attached: {selectedAttachment.name}
                    </div>
                  )}
                  {selectedAttachment.file?.name
                    .toLowerCase()
                    .endsWith(".txt") && (
                    <pre className="mt-3 max-h-44 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                      {selectedAttachment.file
                        ? "Text file ready for conversion."
                        : ""}
                    </pre>
                  )}
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleConvertToDocx}
                      disabled={converting || !selectedAttachment?.file}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Convert to Word
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedAttachment) return;
                        const a = document.createElement("a");
                        a.href = selectedAttachment.url;
                        a.download = selectedAttachment.name;
                        a.click();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                    >
                      Download Attachment
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    Generated Documents
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click a generated file to show its download button.
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {generatedDocs.length} files
                </span>
              </div>
              {generatedDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 text-center">
                  No generated documents yet. Generate PDF or Word to create
                  one.
                </div>
              ) : (
                <div className="space-y-3">
                  {generatedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        activeDoc === doc.id
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 text-left"
                        onClick={() =>
                          setActiveDoc((prev) =>
                            prev === doc.id ? null : doc.id,
                          )
                        }
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {doc.filename}
                          </div>
                          <div className="text-xs text-slate-500">
                            {doc.format.toUpperCase()}
                          </div>
                        </div>
                        <Download size={16} className="text-slate-400" />
                      </button>
                      {activeDoc === doc.id ? (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadGeneratedDoc(doc)}
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          >
                            Download
                          </button>
                          <span className="text-xs text-slate-500">
                            The file is ready to download.
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          ref={attachmentInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleAttachmentSelected(file);
            event.target.value = "";
          }}
        />
      </main>
    </div>
  );
};

export default AIQuestionGenerator;
