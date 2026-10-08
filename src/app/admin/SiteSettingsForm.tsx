"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import type { SiteSettings } from "@/lib/site-settings";
import { updateSiteSettings, type SiteSettingsFormState } from "./actions";

type Props = {
  initial: SiteSettings;
  defaults: SiteSettings;
  limits: Record<keyof SiteSettings, number>;
};

const FIELDS: { key: keyof SiteSettings; label: string; help: string; required?: boolean }[] = [
  { key: "siteName", label: "사이트명", help: "상단 로고 옆, 브라우저 탭 제목, 하단에 표시됩니다.", required: true },
  { key: "siteNameAccent", label: "사이트명 강조 부분", help: "사이트명의 끝부분과 같게 적으면 상단에서 그 부분만 보라색으로 표시됩니다. 비워 두면 강조 없음." },
  { key: "badge", label: "배지 문구", help: "첫 화면 맨 위 작은 배지 (예: 2026 Fall Lecture)." },
  { key: "title", label: "과정명", help: "첫 화면의 큰 제목입니다.", required: true },
  { key: "subtitle", label: "부제", help: "과정명 아래 한 줄 (예: 회사명·기관명)." },
];

const INITIAL_STATE: SiteSettingsFormState = { ok: false, message: "" };

function splitName(name: string, accent: string) {
  if (accent && name.endsWith(accent) && name !== accent) {
    return { lead: name.slice(0, name.length - accent.length), accent };
  }
  return { lead: name, accent: "" };
}

export default function SiteSettingsForm({ initial, defaults, limits }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<SiteSettings>(initial);
  const [state, formAction, pending] = useActionState(updateSiteSettings, INITIAL_STATE);

  async function handleLogout() {
    await fetch("/api/auth/instructor", { method: "DELETE" });
    window.dispatchEvent(new Event("auth-changed"));
    router.refresh();
  }

  const preview = splitName(values.siteName, values.siteNameAccent);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="mt-1 text-sm text-slate-500">사이트에 표시되는 과정 정보를 수정합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
          >
            사이트로 이동
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            로그아웃
          </button>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">사이트 정보</h2>

        <form action={formAction} className="mt-6 space-y-5">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium text-slate-700">
                {field.label}
                {field.required && <span className="ml-1 text-violet-600">*</span>}
              </label>
              <input
                id={field.key}
                name={field.key}
                value={values[field.key]}
                maxLength={limits[field.key]}
                required={field.required}
                onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              />
              <p className="mt-1 text-xs text-slate-400">{field.help}</p>
            </div>
          ))}

          {state.message && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
              }`}
            >
              {state.message}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {pending ? "저장 중..." : "저장"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setValues(defaults)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
            >
              기본값 불러오기
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-slate-500">미리보기</h2>
        <p className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          {preview.lead}
          {preview.accent && <span className="text-violet-600">{preview.accent}</span>}
        </p>
        <div className="mt-6 text-center">
          {values.badge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-medium text-violet-700">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              {values.badge}
            </span>
          )}
          <p className="mt-4 bg-gradient-to-br from-slate-900 via-violet-700 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            {values.title}
          </p>
          {values.subtitle && <p className="mt-2 font-medium text-slate-600">{values.subtitle}</p>}
        </div>
        <p className="mt-6 text-xs text-slate-400">브라우저 탭: {values.siteName} | 강의사이트</p>
      </section>
    </div>
  );
}
