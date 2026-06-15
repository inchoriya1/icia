import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { chatMessageFileName, chatMessageTitle } from "@/lib/chat-export";
import { createMaterialFromBuffer } from "@/lib/materials";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

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

  const materials = [];

  try {
    for (const message of messages) {
      const createdAt = message.createdAt;
      const title = chatMessageTitle(message.content, createdAt);
      const fileName = chatMessageFileName(title, createdAt);
      const description = `채팅 공지에서보냄 · ${formatDate(createdAt.toISOString())}`;
      const buffer = Buffer.from(message.content, "utf-8");

      const material = await createMaterialFromBuffer({
        title,
        description,
        fileName,
        buffer,
        contentType: "text/plain; charset=utf-8",
      });

      materials.push(material);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "보내기에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    count: materials.length,
    materials,
  });
}
