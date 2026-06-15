"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MaterialEditForm from "@/components/MaterialEditForm";

type Material = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
};

export default function EditMaterialPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [material, setMaterial] = useState<Material | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/materials/${params.id}`).then((res) => res.json()),
      fetch("/api/auth/instructor").then((res) => res.json()),
    ])
      .then(([materialData, authData]) => {
        if (authData.isInstructor !== true) {
          router.replace("/admin");
          return;
        }

        if (!materialData.material) {
          setError(materialData.error ?? "자료를 찾을 수 없습니다.");
          setChecking(false);
          return;
        }

        setMaterial(materialData.material);
        setChecking(false);
      })
      .catch(() => {
        setError("자료를 불러올 수 없습니다.");
        setChecking(false);
      });
  }, [params.id, router]);

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-24">
        <p className="text-slate-500">{error || "자료를 찾을 수 없습니다."}</p>
        <Link
          href="/materials"
          className="mt-4 inline-block text-sm font-medium text-violet-600 hover:text-violet-500"
        >
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        href="/materials"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>
      <MaterialEditForm material={material} onSuccess={() => router.push("/materials")} />
    </div>
  );
}
