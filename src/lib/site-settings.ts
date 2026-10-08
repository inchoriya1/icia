import { unstable_cache } from "next/cache";
import { createAdminClient, MATERIALS_BUCKET } from "@/lib/supabase";

export type SiteSettings = {
  siteName: string;
  siteNameAccent: string;
  badge: string;
  title: string;
  subtitle: string;
};

export const SITE_SETTINGS_TAG = "site-settings";

const SETTINGS_PATH = "_site/settings.json";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: "AI 업무활용 실무교육",
  siteNameAccent: "실무교육",
  badge: "2026 Fall Lecture",
  title: "ChatGPT 기반 AI 업무활용 실무교육",
  subtitle: "한국미우라공업 주식회사",
};

export const SITE_SETTINGS_LIMITS: Record<keyof SiteSettings, number> = {
  siteName: 30,
  siteNameAccent: 30,
  badge: 40,
  title: 60,
  subtitle: 60,
};

function normalize(input: Partial<Record<keyof SiteSettings, unknown>>): SiteSettings {
  const result = { ...DEFAULT_SITE_SETTINGS };
  for (const key of Object.keys(DEFAULT_SITE_SETTINGS) as (keyof SiteSettings)[]) {
    const value = input[key];
    if (typeof value === "string") {
      result[key] = value.trim().slice(0, SITE_SETTINGS_LIMITS[key]);
    }
  }
  return result;
}

async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(MATERIALS_BUCKET).download(SETTINGS_PATH);
    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return normalize(JSON.parse(await data.text()));
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export const getSiteSettings = unstable_cache(readSiteSettings, [SITE_SETTINGS_TAG], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 3600,
});

export async function saveSiteSettings(input: Partial<Record<keyof SiteSettings, unknown>>) {
  const settings = normalize(input);
  if (!settings.siteName || !settings.title) {
    throw new Error("사이트명과 과정명은 비워 둘 수 없습니다.");
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    throw new Error("저장소(Supabase) 환경 변수가 없어 저장할 수 없습니다.");
  }

  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(SETTINGS_PATH, JSON.stringify(settings, null, 2), {
      contentType: "application/json",
      cacheControl: "0",
      upsert: true,
    });

  if (error) {
    throw new Error(`저장 실패: ${error.message}`);
  }

  return settings;
}

/** 사이트명 끝이 강조 문구와 같으면 [앞부분, 강조 부분]으로 나눈다. */
export function splitSiteName(settings: Pick<SiteSettings, "siteName" | "siteNameAccent">) {
  const { siteName, siteNameAccent } = settings;
  if (siteNameAccent && siteName.endsWith(siteNameAccent) && siteName !== siteNameAccent) {
    return { lead: siteName.slice(0, siteName.length - siteNameAccent.length), accent: siteNameAccent };
  }
  return { lead: siteName, accent: "" };
}
