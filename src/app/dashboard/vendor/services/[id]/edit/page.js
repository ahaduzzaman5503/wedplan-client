import EditServiceForm from "@/components/dashboard/vendor/EditServiceForm";

export const metadata = {
  title: "Edit Service | WedPlan",
};

export default function EditServicePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Edit Service
      </h1>
      <p className="mt-2 text-muted-foreground">
        Update your service details. Approval status stays the same.
      </p>
      <div className="mt-6">
        <EditServiceForm />
      </div>
    </div>
  );
}

