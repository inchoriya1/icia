"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MaterialUploadForm from "@/components/MaterialUploadForm";

export default function NewMaterialPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    fetch("/api/auth/instructor")
      .then((res) => res.json())
      .then((data) => {
        setIsInstructor(data.isInstructor === true);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!isInstructor) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:py-24">
        <p className="text-slate-500">자료 업로드는 강사만 이용할 수 있습니다.</p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium text-violet-600 hover:text-violet-500"
        >
          /admin 에서 로그인
        </Link>
        <Link
          href="/materials"
          className="mt-6 block text-sm text-slate-400 hover:text-slate-600"
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
      <MaterialUploadForm onSuccess={() => router.push("/materials")} />
    </div>
  );
}
