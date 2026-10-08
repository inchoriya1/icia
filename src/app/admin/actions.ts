"use server";

import { revalidatePath, updateTag } from "next/cache";
import { isInstructor } from "@/lib/auth";
import { saveSiteSettings, SITE_SETTINGS_TAG, type SiteSettings } from "@/lib/site-settings";

export type SiteSettingsFormState = {
  ok: boolean;
  message: string;
  settings?: SiteSettings;
};

export async function updateSiteSettings(
  _prev: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  if (!(await isInstructor())) {
    return { ok: false, message: "강사만 수정할 수 있습니다. 다시 로그인해 주세요." };
  }

  try {
    const settings = await saveSiteSettings({
      siteName: formData.get("siteName"),
      siteNameAccent: formData.get("siteNameAccent"),
      badge: formData.get("badge"),
      title: formData.get("title"),
      subtitle: formData.get("subtitle"),
    });

    updateTag(SITE_SETTINGS_TAG);
    revalidatePath("/", "layout");

    return { ok: true, message: "저장했습니다. 사이트에 바로 반영됩니다.", settings };
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장에 실패했습니다.";
    return { ok: false, message };
  }
}
