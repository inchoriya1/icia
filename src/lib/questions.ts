import { createAdminClient, QUESTION_IMAGES_BUCKET } from "@/lib/supabase";

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
