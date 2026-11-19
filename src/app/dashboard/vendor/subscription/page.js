import SubscriptionPlans from "@/components/dashboard/vendor/SubscriptionPlans";

export const metadata = {
  title: "Subscription | WedPlan",
};

export default function SubscriptionPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Subscription
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Choose the plan that fits your business. Upgrade to publish unlimited
        services.
      </p>
      <SubscriptionPlans />
    </div>
  );
}


