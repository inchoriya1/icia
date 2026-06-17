import { NextRequest, NextResponse } from "next/server";
import { isInstructor } from "@/lib/auth";
import { attachImageUrls } from "@/lib/questions";
import {
  fetchQuestionsPage,
  parseQuestionStatus,
  parseQuestionsPage,
} from "@/lib/questions-list";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_QUESTION_IMAGES,
} from "@/lib/question-constants";
import { prisma } from "@/lib/prisma";
import { createAdminClient, QUESTION_IMAGES_BUCKET } from "@/lib/supabase";
import { buildStoragePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters = {
    page: parseQuestionsPage(searchParams.get("page") ?? undefined),
    status: parseQuestionStatus(searchParams.get("status") ?? undefined),
    q: searchParams.get("q")?.trim() ?? "",
  };

  const { data, dbUnavailable } = await fetchQuestionsPage(filters);

  return NextResponse.json({
    ...data,
    isInstructor: await isInstructor(),
    dbUnavailable,
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  const imageFiles = formData.getAll("images").filter((item): item is File => item instanceof File);

  if (!title || !content) {
    return NextResponse.json(
      { error: "제목과 내용을 모두 입력해 주세요." },
      { status: 400 },
    );
  }

  if (imageFiles.length > MAX_QUESTION_IMAGES) {
    return NextResponse.json(
      { error: `이미지는 최대 ${MAX_QUESTION_IMAGES}장까지 업로드할 수 있습니다.` },
      { status: 400 },
    );
  }

  for (const file of imageFiles) {
    if (file.size === 0) continue;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, GIF, WEBP 이미지만 업로드할 수 있습니다." },
        { status: 400 },
      );
    }
  }

  const validImages = imageFiles.filter((file) => file.size > 0);
  const questionId = crypto.randomUUID();
  const supabase = createAdminClient();
  const uploadedPaths: string[] = [];

  try {
    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      const storagePath = buildStoragePath(questionId, file.name, i);
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage
        .from(QUESTION_IMAGES_BUCKET)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      uploadedPaths.push(storagePath);
    }

    const question = await prisma.question.create({
      data: {
        id: questionId,
        title,
        content,
        images: {
          create: validImages.map((file, index) => ({
            fileName: file.name,
            storagePath: uploadedPaths[index],
            sortOrder: index,
          })),
        },
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });

    const withUrls = await attachImageUrls(question);
    return NextResponse.json(withUrls, { status: 201 });
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from(QUESTION_IMAGES_BUCKET).remove(uploadedPaths);
    }

    const message = error instanceof Error ? error.message : "등록에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
