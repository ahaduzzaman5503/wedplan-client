import AddServiceForm from "@/components/dashboard/vendor/AddServiceForm";

export const metadata = {
  title: "Add Service | WedPlan",
};

export default function AddServicePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Add Service
      </h1>
      <p className="mt-2 text-muted-foreground">
        Fill in the details below. Your service will be reviewed by an admin
        before it appears on the website.
      </p>
      <div className="mt-6">
        <AddServiceForm />
      </div>
    </div>
  );
}


