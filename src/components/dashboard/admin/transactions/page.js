import Transactions from "@/components/dashboard/admin/Transactions";

export const metadata = {
  title: "Transactions | WedPlan",
};

export default function TransactionsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Transactions
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Subscription payments made by vendors. These records are read-only and
        are created automatically from verified Stripe payments.
      </p>
      <Transactions />
    </div>
  );
}

