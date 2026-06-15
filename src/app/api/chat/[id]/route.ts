import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 삭제할 수 있습니다." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.chatMessage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "공지를 찾을 수 없습니다." }, { status: 404 });
  }
}
