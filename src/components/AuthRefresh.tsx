"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRefresh() {
  const router = useRouter();

  useEffect(() => {
    const handler = () => router.refresh();
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, [router]);

  return null;
}
