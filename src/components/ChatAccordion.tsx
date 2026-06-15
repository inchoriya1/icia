"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import ChatMessageItem, { type ChatMessage } from "@/components/ChatMessageItem";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatAccordion() {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [content, setContent] = useState("");
  const [sendError, setSendError] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteAllLoading, setDeleteAllLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const [chatRes, authRes] = await Promise.all([
        fetch("/api/chat"),
        fetch("/api/auth/instructor"),
      ]);
      const data = await chatRes.json();
      const authData = await authRes.json();
      setMessages(data.messages ?? []);
      setIsInstructor(authData.isInstructor === true);
      setLoaded(true);
      if (data.dbUnavailable) {
        setPolling(false);
      }
    } catch {
      setPolling(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!expanded || !polling) return;

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [expanded, fetchMessages, polling]);

  useEffect(() => {
    const handler = () => fetchMessages();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [fetchMessages]);

  useEffect(() => {
    if (listRef.current && expanded) {
      listRef.current.scrollTop = 0;
    }
  }, [messages, expanded]);

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleDelete(id: string) {
    if (!confirm("이 공지를 삭제할까요?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchMessages();
        window.dispatchEvent(new Event("auth-changed"));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSendError("");
    setSendLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSendError(data.error ?? "전송에 실패했습니다.");
        return;
      }

      setContent("");
      await fetchMessages();
    } catch {
      setSendError("네트워크 오류가 발생했습니다.");
    } finally {
      setSendLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/instructor", { method: "DELETE" });
    setIsInstructor(false);
    window.dispatchEvent(new Event("auth-changed"));
  }

  async function handleExportToMaterials() {
    if (messages.length === 0) {
      setActionError("보낼 공지가 없습니다.");
      setActionMessage("");
      return;
    }

    if (!confirm(`공지 ${messages.length}개를 자료실로보낼까요?\n(각 공지가 제목과 함께 텍스트 파일로 등록됩니다)`)) {
      return;
    }

    setActionError("");
    setActionMessage("");
    setExportLoading(true);

    try {
      const res = await fetch("/api/chat/export", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error ?? "보내기에 실패했습니다.");
        return;
      }

      setActionMessage(`${data.count}개 공지를 자료실에 등록했습니다.`);
      window.dispatchEvent(new Event("auth-changed"));
    } catch {
      setActionError("네트워크 오류가 발생했습니다.");
    } finally {
      setExportLoading(false);
    }
  }

  async function handleDeleteAll() {
    if (messages.length === 0) return;
    if (!confirm("모든 공지를 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;

    setActionError("");
    setActionMessage("");
    setDeleteAllLoading(true);

    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error ?? "삭제에 실패했습니다.");
        return;
      }

      setActionMessage(`공지 ${data.count}개를 삭제했습니다.`);
      await fetchMessages();
      window.dispatchEvent(new Event("auth-changed"));
    } catch {
      setActionError("네트워크 오류가 발생했습니다.");
    } finally {
      setDeleteAllLoading(false);
    }
  }

  return (
    <section className="mt-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-8 text-left transition hover:bg-slate-50"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">💬 실시간 공지 채팅</h2>
          {isInstructor && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
              작성 가능
            </span>
          )}
        </div>
        <span
          className={`shrink-0 rounded-lg bg-slate-100 p-2 text-slate-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 px-8 pb-8 pt-2">
            <div
              ref={listRef}
              className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              {!loaded ? (
                <p className="py-8 text-center text-sm text-slate-400">불러오는 중...</p>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">아직 공지가 없습니다.</p>
              ) : (
                messages.map((msg) => (
                  <ChatMessageItem
                    key={msg.id}
                    message={msg}
                    formattedTime={formatTime(msg.createdAt)}
                    copied={copiedId === msg.id}
                    canDelete={isInstructor}
                    deleting={deletingId === msg.id}
                    onCopy={(text) => handleCopy(text, msg.id)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>

            {isInstructor && messages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportToMaterials}
                  disabled={exportLoading || deleteAllLoading}
                  className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                >
                  {exportLoading ? "보내는 중..." : "자료실로보내기"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAll}
                  disabled={exportLoading || deleteAllLoading}
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {deleteAllLoading ? "삭제 중..." : "채팅 전체 삭제"}
                </button>
              </div>
            )}

            {(actionMessage || actionError) && (
              <p
                className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                  actionError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {actionError || actionMessage}
              </p>
            )}

            {isInstructor && (
              <form onSubmit={handleSend} className="mt-4 space-y-3">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="공지 작성..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
                {sendError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{sendError}</p>
                )}
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-slate-400 transition hover:text-slate-600"
                  >
                    작성 모드 종료
                  </button>
                  <button
                    type="submit"
                    disabled={sendLoading || !content.trim()}
                    className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 disabled:opacity-50"
                  >
                    {sendLoading ? "전송 중..." : "공지 전송"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
