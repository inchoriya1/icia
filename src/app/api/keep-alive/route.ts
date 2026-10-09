import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Supabase 무료 플랜은 7일간 활동이 없으면 일시 중지되므로
// Vercel Cron(vercel.json)이 주기적으로 호출해 DB에 가벼운 조회를 보낸다.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.material.findFirst({ select: { id: true } });
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    console.error("keep-alive failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
