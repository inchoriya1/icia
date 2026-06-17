import Link from "next/link";
import Pagination from "@/components/Pagination";
import { formatDate } from "@/lib/utils";
import {
  fetchQuestionsPage,
  parseQuestionStatus,
  parseQuestionsPage,
  questionsListHref,
} from "@/lib/questions-list";

type Props = {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
};

export default async function QuestionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    page: parseQuestionsPage(params.page),
    status: parseQuestionStatus(params.status),
    q: params.q?.trim() ?? "",
  };

  const { data } = await fetchQuestionsPage(filters);
  const { questions, total, page, totalPages } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">질문게시판</h1>
          <p className="mt-2 text-slate-500">익명으로 질문하고 답변 현황을 확인하세요.</p>
        </div>
        <Link
          href="/questions/new"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
        >
          작성하기
        </Link>
      </div>

      <form method="get" action="/questions" className="mb-4 flex gap-2">
        <input type="hidden" name="status" value={filters.status} />
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="제목·내용 검색"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button
          type="submit"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          검색
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["all", "open", "resolved"] as const).map((status) => (
            <Link
              key={status}
              href={questionsListHref({ page: 1, status, q: filters.q })}
              prefetch
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filters.status === status
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "all" ? "전체" : status === "open" ? "미해결" : "완료"}
            </Link>
          ))}
        </div>
        <p className="text-sm text-slate-400">총 {total}건</p>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-400">
            {filters.q ? "검색 결과가 없습니다." : "등록된 질문이 없습니다."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              prefetch
              className={`block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 ${
                question.isResolved
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-slate-900">{question.title}</h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    question.isResolved
                      ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                  }`}
                >
                  {question.isResolved ? "완료" : "미해결"}
                </span>
                {question._count.images > 0 && (
                  <span className="text-xs text-slate-400">📷 {question._count.images}</span>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">{question.content}</p>
              <p className="mt-3 text-xs text-slate-400">{formatDate(question.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hrefForPage={(p) => questionsListHref({ ...filters, page: p })}
      />
    </div>
  );
}
