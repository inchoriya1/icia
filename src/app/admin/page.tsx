import { isInstructor } from "@/lib/auth";
import {
  DEFAULT_SITE_SETTINGS,
  getSiteSettings,
  SITE_SETTINGS_LIMITS,
} from "@/lib/site-settings";
import AdminLogin from "./AdminLogin";
import SiteSettingsForm from "./SiteSettingsForm";

export default async function AdminPage() {
  if (!(await isInstructor())) {
    return <AdminLogin />;
  }

  const settings = await getSiteSettings();

  return (
    <SiteSettingsForm
      initial={settings}
      defaults={DEFAULT_SITE_SETTINGS}
      limits={SITE_SETTINGS_LIMITS}
    />
  );
}
