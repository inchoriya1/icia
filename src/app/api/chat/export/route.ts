import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { buildChatExportBundle } from "@/lib/chat-export";
import { createMaterialFromBuffer } from "@/lib/materials";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 보낼 수 있습니다." }, { status: 401 });
  }

  const messages = await prisma.chatMessage.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (messages.length === 0) {
    return NextResponse.json({ error: "보낼 공지가 없습니다." }, { status: 400 });
  }

  const { title, description, fileName, content } = buildChatExportBundle(messages);

  try {
    const material = await createMaterialFromBuffer({
      title,
      description,
      fileName,
      buffer: Buffer.from(content, "utf-8"),
      contentType: "text/plain; charset=utf-8",
    });

    return NextResponse.json({
      count: 1,
      messageCount: messages.length,
      material,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "보내기에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
