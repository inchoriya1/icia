import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 답글을 작성할 수 있습니다." }, { status: 401 });
  }

  const { id: questionId } = await context.params;
  const { content } = await request.json();
  const trimmed = content?.trim();

  if (!trimmed) {
    return NextResponse.json({ error: "답글 내용을 입력해 주세요." }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  const reply = await prisma.questionReply.create({
    data: { questionId, content: trimmed },
  });

  return NextResponse.json(reply, { status: 201 });
}
