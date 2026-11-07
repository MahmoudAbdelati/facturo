import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AppearanceCard } from "@/components/settings/appearance-card";
import { PasswordForm } from "@/components/settings/password-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { demoAccount, demoEnabled } from "@/lib/demo";
import { getCurrentUser } from "@/lib/queries/users";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" subtitle="Your profile, business details and preferences." />
      <div className="space-y-6">
        <ProfileForm user={user} />
        <AppearanceCard />
        <PasswordForm isDemo={demoEnabled && user.email === demoAccount.email} />
      </div>
    </div>
  );
}
