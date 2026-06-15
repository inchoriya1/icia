import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAdminClient, MATERIALS_BUCKET } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const material = await prisma.material.findUnique({ where: { id } });

  if (!material) {
    return NextResponse.json({ error: "자료를 찾을 수 없습니다." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(material.storagePath, 3600);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "다운로드 링크 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
