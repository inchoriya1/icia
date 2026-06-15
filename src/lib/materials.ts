import { prisma } from "@/lib/prisma";
import { createAdminClient, MATERIALS_BUCKET } from "@/lib/supabase";
import { buildStoragePath } from "@/lib/utils";

type CreateMaterialInput = {
  title: string;
  description?: string | null;
  fileName: string;
  buffer: Buffer;
  contentType?: string;
};

export async function createMaterialFromBuffer(input: CreateMaterialInput) {
  const id = crypto.randomUUID();
  const storagePath = buildStoragePath(id, input.fileName);
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(storagePath, input.buffer, {
      contentType: input.contentType ?? "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`업로드 실패: ${uploadError.message}`);
  }

  return prisma.material.create({
    data: {
      id,
      title: input.title,
      description: input.description ?? null,
      fileName: input.fileName,
      storagePath,
      fileSize: input.buffer.length,
    },
  });
}
