"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Material = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
};

type Props = {
  material: Material;
  onSuccess?: () => void;
};

export default function MaterialEditForm({ material, onSuccess }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(material.title);
  const [description, setDescription] = useState(material.description ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(material.title);
    setDescription(material.description ?? "");
    setFile(null);
  }, [material]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (file) formData.append("file", file);

      const res = await fetch(`/api/materials/${material.id}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "수정에 실패했습니다.");
        return;
      }

      onSuccess?.();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h1 className="text-2xl font-bold text-slate-900">자료 수정</h1>
      <p className="mt-2 text-sm text-slate-500">제목·설명을 수정하거나 파일을 교체할 수 있습니다.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
            제목
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
            설명 (선택)
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
        <div>
          <label htmlFor="file" className="mb-1.5 block text-sm font-medium text-slate-700">
            파일 교체 (선택)
          </label>
          <p className="mb-2 text-xs text-slate-400">현재 파일: {material.fileName}</p>
          <input
            id="file"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/materials")}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
        >
          {loading ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
