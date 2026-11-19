import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MyServices from "@/components/dashboard/vendor/MyServices";

export const metadata = {
  title: "My Services | WedPlan",
};

export default function MyServicesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">
            My Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            View, edit and manage the services you offer.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/vendor/add-service" />}
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>
      <MyServices />
    </div>
  );
}


