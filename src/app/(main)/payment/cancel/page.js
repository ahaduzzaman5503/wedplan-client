import Link from "next/link";
import { XCircle } from "lucide-react";
import ProtectedArea from "@/components/auth/ProtectedArea";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Payment Cancelled | WedPlan",
};

export default function PaymentCancelPage() {
  return (
    <ProtectedArea roles={["vendor"]}>
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <XCircle className="h-16 w-16 text-destructive" />
        <h1 className="mt-4 font-heading text-3xl font-bold">
          Payment cancelled
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your payment was not completed and you have not been charged. You can
          try again whenever you are ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/vendor/subscription" />}
          >
            Try Again
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


