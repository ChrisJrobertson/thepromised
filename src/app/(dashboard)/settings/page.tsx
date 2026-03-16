import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PagePlaceholder
      ctaHref="/settings/profile"
      ctaLabel="Go to profile settings"
      description="Use the settings area to manage profile details, billing, and notifications."
      title="Settings"
    />
  );
}
