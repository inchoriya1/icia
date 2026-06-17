import { withDbFallback } from "@/lib/db-error";
import { prisma } from "@/lib/prisma";
import { createAdminClient, QUESTION_IMAGES_BUCKET } from "@/lib/supabase";

export type QuestionDetail = {
  id: string;
  title: string;
  content: string;
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  images: {
    id: string;
    fileName: string;
    sortOrder: number;
    url: string | null;
  }[];
  replies: {
    id: string;
    content: string;
    createdAt: string;
  }[];
};

type QuestionImageRecord = {
  id: string;
  fileName: string;
  storagePath: string;
  sortOrder: number;
};

export async function attachImageUrls<T extends { images: QuestionImageRecord[] }>(
  question: T,
) {
  const supabase = createAdminClient();

  const images = await Promise.all(
    question.images.map(async (image) => {
      const { data } = await supabase.storage
        .from(QUESTION_IMAGES_BUCKET)
        .createSignedUrl(image.storagePath, 3600);

      return {
        id: image.id,
        fileName: image.fileName,
        sortOrder: image.sortOrder,
        url: data?.signedUrl ?? null,
      };
    }),
  );

  return { ...question, images };
}

export async function fetchQuestionById(id: string) {
  return withDbFallback<QuestionDetail | null>(null, async () => {
    const result = await prisma.question.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!result) return null;

    const withUrls = await attachImageUrls(result);

    return {
      id: withUrls.id,
      title: withUrls.title,
      content: withUrls.content,
      isResolved: withUrls.isResolved,
      resolvedAt: withUrls.resolvedAt?.toISOString() ?? null,
      createdAt: withUrls.createdAt.toISOString(),
      images: withUrls.images,
      replies: withUrls.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
      })),
    };
  });
}
