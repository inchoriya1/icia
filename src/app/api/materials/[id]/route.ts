import { NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { deleteMaterial, updateMaterial } from "@/lib/materials";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) {
    return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    material,
    isInstructor: await isInstructor(),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 수정할 수 있습니다." }, { status: 401 });
  }

  const { id } = await context.params;
  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const file = formData.get("file");

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }

  try {
    const material = await updateMaterial({
      id,
      title,
      description,
      file: file instanceof File && file.size > 0 ? file : undefined,
    });

    return NextResponse.json(material);
  } catch (error) {
    const message = error instanceof Error ? error.message : "수정에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isInstructor())) {
    return NextResponse.json({ error: "강사만 삭제할 수 있습니다." }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteMaterial(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "삭제에 실패했습니다.";
    const status = message.includes("찾을 수 없습니다") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
