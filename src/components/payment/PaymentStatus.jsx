"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { isPremiumUser } from "@/lib/subscription";

const MAX_CHECKS = 15; // 15 checks, 2 seconds apart = 30 seconds

export default function PaymentStatus() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;
  const premium = isPremiumUser(user);
  const [timedOut, setTimedOut] = useState(false);

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  // Ask for the latest plan every 2 seconds until the webhook has done its job
  useEffect(() => {
    if (premium) return;
    let checks = 0;
    const timer = setInterval(() => {
      checks += 1;
      refetchRef.current();
      if (checks >= MAX_CHECKS) {
        clearInterval(timer);
        setTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [premium]);

  if (premium) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-left text-sm text-green-900">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">Your Premium plan is now active</p>
          <p className="mt-1">
            You can publish unlimited services
            {user?.subscriptionExpiresAt
              ? `. Current period ends on ${formatDate(user.subscriptionExpiresAt)}.`
              : "."}
          </p>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="mt-6 rounded-xl border bg-secondary/50 p-4 text-left text-sm text-muted-foreground">
        We are still waiting for Stripe to confirm your payment. This can take a
        little longer sometimes. Please check your Subscription page in a few
        minutes. If you were charged and the plan is still Free after that,
        please contact support.
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border bg-secondary/50 p-4 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      Confirming your payment with Stripe...
    </div>
  );
}

