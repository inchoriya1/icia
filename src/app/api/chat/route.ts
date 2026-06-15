import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { withDbFallback } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: messages, dbUnavailable } = await withDbFallback(
    [],
    () => prisma.chatMessage.findMany({ orderBy: { createdAt: "asc" } }),
  );

  return NextResponse.json({
    messages,
    isInstructor: await isInstructor(),
    dbUnavailable,
  });
}

export async function POST(request: Request) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 작성할 수 있습니다." }, { status: 401 });
  }

  const { content } = await request.json();
  const trimmed = content?.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: { content: trimmed },
  });

  return NextResponse.json(message, { status: 201 });
}
