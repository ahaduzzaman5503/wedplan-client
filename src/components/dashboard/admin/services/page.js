import ManageServices from "@/components/dashboard/admin/ManageServices";

export const metadata = {
  title: "Manage Services | WedPlan",
};

export default function ManageServicesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Manage Services
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Review submitted services. Only approved and active services are visible
        to customers.
      </p>
      <ManageServices />
    </div>
  );
}

