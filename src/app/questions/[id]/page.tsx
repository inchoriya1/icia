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
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200/60" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-slate-500">{error || "질문을 찾을 수 없습니다."}</p>
        <Link href="/questions" className="mt-4 inline-block text-sm text-violet-600 hover:text-violet-500">
          목록으로
        </Link>
      </div>
    );
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
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              question.isResolved
                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
            }`}
          >
            {question.isResolved ? "해결됨" : "미해결"}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">익명</span>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          {formatDate(question.createdAt)}
          {question.isResolved && question.resolvedAt && (
            <> · 해결: {formatDate(question.resolvedAt)}</>
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
    </div>
  );
}
