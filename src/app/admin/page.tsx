"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/instructor");
    const data = await res.json();

    if (data.isInstructor === true) {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error ?? "비밀번호가 올바르지 않습니다.");
        return;
      }

      window.dispatchEvent(new Event("auth-changed"));
      router.replace("/");
    } catch {
      setLoginError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoginLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        <p className="mt-2 text-sm text-slate-500">비밀번호 입력 후 사이트로 이동합니다.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="비밀번호 입력"
              autoFocus
            />
          </div>

          {loginError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={loginLoading || !password}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
          >
            {loginLoading ? "확인 중..." : "입장"}
          </button>
        </form>
      </div>
    </div>
  );
}
