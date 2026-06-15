import { createClient } from "@supabase/supabase-js";

export const MATERIALS_BUCKET = "materials";
export const QUESTION_IMAGES_BUCKET = "question-images";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(url, key);
}
