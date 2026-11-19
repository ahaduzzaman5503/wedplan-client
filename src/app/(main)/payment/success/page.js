import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import ProtectedArea from "@/components/auth/ProtectedArea";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Successful | WedPlan",
};

export default function PaymentSuccessPage() {
  return (
    <ProtectedArea roles={["vendor"]}>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h1 className="mt-4 font-heading text-3xl font-bold">
          Payment received
        </h1>
        <p className="mt-3 text-muted-foreground">
          Thank you! Stripe is confirming your payment. Your Premium plan is
          activated automatically once the payment is verified, which usually
          takes a few seconds.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your Subscription page to see your current plan.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/vendor/subscription" />}
          >
            View Subscription
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/dashboard/vendor" />}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </ProtectedArea>
  );
}


