import ManageUsers from "@/components/dashboard/admin/ManageUsers";

export const metadata = {
  title: "Manage Users | WedPlan",
};

export default function ManageUsersPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Manage Users
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Search users, review their activity, and block or unblock accounts.
      </p>
      <ManageUsers />
    </div>
  );
}
