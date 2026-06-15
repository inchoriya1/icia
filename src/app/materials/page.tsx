"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatFileSize } from "@/lib/utils";

type Material = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number | null;
  createdAt: string;
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const [materialsRes, authRes] = await Promise.all([
        fetch("/api/materials"),
        fetch("/api/auth/instructor"),
      ]);
      const materialsData = await materialsRes.json();
      const authData = await authRes.json();
      setMaterials(materialsData.materials ?? []);
      setIsInstructor(authData.isInstructor === true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
    const handler = () => fetchMaterials();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [fetchMaterials]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">자료실</h1>
          <p className="mt-2 text-slate-500">강의 자료를 다운로드 받을 수 있습니다.</p>
        </div>
        {isInstructor && (
          <Link
            href="/materials/new"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500"
          >
            자료 업로드
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
          ))}
        </div>
      ) : materials.length === 0 ? (
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
              <a
                href={`/api/materials/${material.id}/download`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-violet-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                다운로드
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
