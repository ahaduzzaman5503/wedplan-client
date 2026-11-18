import { Suspense } from "react";
import ServicesBrowser from "@/components/services/ServicesBrowser";
import ServiceCardSkeleton from "@/components/services/ServiceCardSkeleton";

export const metadata = {
  title: "Browse Services | WedPlan",
  description: "Search and filter wedding services from trusted vendors.",
};

function BrowseFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<BrowseFallback />}>
      <ServicesBrowser />
    </Suspense>
  );
}
