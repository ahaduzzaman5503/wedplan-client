import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata = {
  title: "Profile Settings | WedPlan",
};

export default function ProfileSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Profile Settings
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Update your personal information and profile photo.
      </p>
      <ProfileForm />
    </div>
  );
}


