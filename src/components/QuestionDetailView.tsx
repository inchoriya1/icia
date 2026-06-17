"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionDetail } from "@/lib/questions";
import { formatDate } from "@/lib/utils";

type Props = {
  question: QuestionDetail;
  isInstructor: boolean;
};

export default function QuestionDetailView({ question: initial, isInstructor }: Props) {
  const router = useRouter();
  const [question, setQuestion] = useState(initial);
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);

  async function handleToggleResolved() {
    if (!isInstructor || statusLoading) return;

    setStatusLoading(true);
    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isResolved: !question.isResolved }),
      });

      const data = await res.json();
      if (!res.ok) return;

      setQuestion((prev) => ({
        ...prev,
        isResolved: data.isResolved,
        resolvedAt: data.resolvedAt ?? null,
      }));
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    setReplyError("");
    setReplyLoading(true);

    try {
      const res = await fetch(`/api/questions/${question.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setReplyError(data.error ?? "답글 등록에 실패했습니다.");
        return;
      }

      setReplyContent("");
      router.refresh();
    } catch {
      setReplyError("네트워크 오류가 발생했습니다.");
    } finally {
      setReplyLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/questions"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      <article
        className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${
          question.isResolved
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{question.title}</h1>
          {isInstructor ? (
            <button
              type="button"
              onClick={handleToggleResolved}
              disabled={statusLoading}
              title="클릭하여 상태 변경"
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:opacity-80 disabled:opacity-50 ${
                question.isResolved
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
              }`}
            >
              {statusLoading ? "변경 중..." : question.isResolved ? "완료" : "미해결"}
            </button>
          ) : (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                question.isResolved
                  ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
              }`}
            >
              {question.isResolved ? "완료" : "미해결"}
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">익명</span>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          {formatDate(question.createdAt)}
          {question.isResolved && question.resolvedAt && (
            <> · 완료: {formatDate(question.resolvedAt)}</>
          )}
        </p>

        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {question.content}
        </p>

        {question.images.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-slate-500">첨부 이미지</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.images.map((image) =>
                image.url ? (
                  <a
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-xl border border-slate-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="aspect-video w-full object-cover transition hover:opacity-90"
                    />
                  </a>
                ) : null,
              )}
            </div>
          </div>
        )}
      </article>

      {question.replies.length > 0 && (
        <section className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            답글 {question.replies.length}개
          </h2>
          {question.replies.map((reply) => (
            <article
              key={reply.id}
              className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                  강사
                </span>
                <span className="text-xs text-slate-400">{formatDate(reply.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {reply.content}
              </p>
            </article>
          ))}
        </section>
      )}

      {isInstructor && (
        <form onSubmit={handleReply} className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">답글 작성</h2>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            placeholder="답글을 입력하세요..."
            className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          {replyError && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{replyError}</p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={replyLoading || !replyContent.trim()}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500 disabled:opacity-50"
            >
              {replyLoading ? "등록 중..." : "답글 등록"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
