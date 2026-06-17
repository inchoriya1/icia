"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Pagination from "@/components/Pagination";
import {
  type MaterialListItem,
  materialsPageHref,
} from "@/lib/materials-list";
import { formatDate, formatFileSize } from "@/lib/utils";

type Props = {
  materials: MaterialListItem[];
  total: number;
  page: number;
  totalPages: number;
  isInstructor: boolean;
};

export default function MaterialsList({
  materials,
  total,
  page,
  totalPages,
  isInstructor,
}: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`「${title}」 자료를 삭제할까요?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (materials.length === 1 && page > 1) {
          router.push(materialsPageHref(page - 1));
        } else {
          router.refresh();
        }
        window.dispatchEvent(new Event("auth-changed"));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {total > 0 && <p className="mb-4 text-sm text-slate-400">총 {total}건</p>}

      {materials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-slate-400">등록된 자료가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {materials.map((material) => (
            <article
              key={material.id}
              className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{material.title}</h2>
                    {material.description && (
                      <p className="mt-1 text-sm text-slate-500">{material.description}</p>
                    )}
                    <p className="mt-2 text-xs text-slate-400">
                      {material.fileName}
                      {material.fileSize ? ` · ${formatFileSize(material.fileSize)}` : ""}
                      {" · "}
                      {formatDate(material.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <a
                  href={`/api/materials/${material.id}/download`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  다운로드
                </a>
                {isInstructor && (
                  <>
                    <Link
                      href={`/materials/${material.id}/edit`}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      수정
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(material.id, material.title)}
                      disabled={deletingId === material.id}
                      className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === material.id ? "삭제 중..." : "삭제"}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} hrefForPage={materialsPageHref} />
    </>
  );
}
