"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";

type QuestionImage = {
  id: string;
  fileName: string;
  sortOrder: number;
  url: string | null;
};

type Question = {
  id: string;
  title: string;
  content: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  images: QuestionImage[];
};

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/questions/${params.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "질문을 불러올 수 없습니다.");
        setQuestion(null);
        return;
      }

      setQuestion(data.question);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-slate-400">{error || "질문을 찾을 수 없습니다."}</p>
        <Link href="/questions" className="mt-4 inline-block text-sm text-violet-400 hover:text-violet-300">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/questions"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      <article
        className={`rounded-2xl border p-6 backdrop-blur-sm sm:p-8 ${
          question.isResolved
            ? "border-emerald-500/20 bg-emerald-500/5"
            : "border-white/10 bg-white/5"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-white">{question.title}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              question.isResolved
                ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
            }`}
          >
            {question.isResolved ? "해결됨" : "미해결"}
          </span>
          <span className="rounded-full bg-slate-700/50 px-2 py-0.5 text-xs text-slate-400">익명</span>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {formatDate(question.createdAt)}
          {question.isResolved && question.resolvedAt && (
            <> · 해결: {formatDate(question.resolvedAt)}</>
          )}
        </p>

        <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {question.content}
        </p>

        {question.images.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-slate-400">첨부 이미지</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {question.images.map((image) =>
                image.url ? (
                  <a
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-xl border border-white/10"
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
    </div>
  );
}
