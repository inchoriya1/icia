import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { withDbFallback } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";
import { createAdminClient, MATERIALS_BUCKET } from "@/lib/supabase";
import { buildStoragePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: materials, dbUnavailable } = await withDbFallback(
    [],
    () => prisma.material.findMany({ orderBy: { createdAt: "desc" } }),
  );

  return NextResponse.json({
    materials,
    isInstructor: await isInstructor(),
    dbUnavailable,
  });
}

export async function POST(request: Request) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 업로드할 수 있습니다." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const file = formData.get("file");

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const storagePath = buildStoragePath(id, file.name);

  const supabase = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: `업로드 실패: ${uploadError.message}` },
      { status: 500 },
    );
  }

  const material = await prisma.material.create({
    data: {
      id,
      title,
      description,
      fileName: file.name,
      storagePath,
      fileSize: file.size,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
