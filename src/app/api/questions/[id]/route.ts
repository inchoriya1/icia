import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { withDbFallback } from "@/lib/db-error";
import { attachImageUrls } from "@/lib/questions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const { data: question, dbUnavailable } = await withDbFallback(null, async () => {
    const result = await prisma.question.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    if (!result) return null;
    return attachImageUrls(result);
  });

  if (dbUnavailable) {
    return NextResponse.json({ error: "DB 연결에 실패했습니다." }, { status: 503 });
  }

  if (!question) {
    return NextResponse.json({ error: "질문을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    question,
    isInstructor: await isInstructor(),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 변경할 수 있습니다." }, { status: 401 });
  }

  const { id } = await context.params;
  const { isResolved } = await request.json();

  if (typeof isResolved !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      isResolved,
      resolvedAt: isResolved ? new Date() : null,
    },
  });

  return NextResponse.json(question);
}
