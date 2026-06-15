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

export async function deleteMaterialStorage(storagePath: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(MATERIALS_BUCKET).remove([storagePath]);
  if (error) {
    throw new Error(`파일 삭제 실패: ${error.message}`);
  }
}

type UpdateMaterialInput = {
  id: string;
  title: string;
  description?: string | null;
  file?: File;
};

export async function updateMaterial(input: UpdateMaterialInput) {
  const existing = await prisma.material.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new Error("자료를 찾을 수 없습니다.");
  }

  if (!input.file) {
    return prisma.material.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description ?? null,
      },
    });
  }

  const buffer = Buffer.from(await input.file.arrayBuffer());
  const newStoragePath = buildStoragePath(input.id, input.file.name);
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(newStoragePath, buffer, {
      contentType: input.file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`업로드 실패: ${uploadError.message}`);
  }

  await deleteMaterialStorage(existing.storagePath);

  return prisma.material.update({
    where: { id: input.id },
    data: {
      title: input.title,
      description: input.description ?? null,
      fileName: input.file.name,
      storagePath: newStoragePath,
      fileSize: buffer.length,
    },
  });
}

export async function deleteMaterial(id: string) {
  const existing = await prisma.material.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("자료를 찾을 수 없습니다.");
  }

  await deleteMaterialStorage(existing.storagePath);
  await prisma.material.delete({ where: { id } });
}
