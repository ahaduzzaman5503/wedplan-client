"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Crown, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatMoney } from "@/lib/format";
import {
  FREE_PLAN_ACTIVE_LIMIT,
  PREMIUM_PRICE_CENTS,
  isPremiumUser,
} from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const freeFeatures = [
  `Maximum ${FREE_PLAN_ACTIVE_LIMIT} active services`,
  "Basic vendor dashboard",
  "Booking request management",
];

const premiumFeatures = [
  "Unlimited active services",
  "Premium vendor badge",
  "All Free plan features",
];

function Feature({ children }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{children}</span>
    </li>
  );
}

export default function SubscriptionPlans() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const premium = isPremiumUser(user);
  const [loading, setLoading] = useState(false);

  // If the vendor presses "Back" from Stripe, the page comes back as it was.
  // This makes sure the button is not stuck on "Redirecting...".
  useEffect(() => {
    const reset = (event) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const result = await apiFetch("/api/payments/create-checkout-session", {
        method: "POST",
      });
      if (!result.url) throw new Error("Could not start the payment");
      // Go to Stripe's secure Checkout page
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error.message || "Could not start the payment");
      setLoading(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Free plan */}
      <Card className={!premium ? "border-primary" : ""}>
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold">Free</h2>
            {!premium && <Badge>Current plan</Badge>}
          </div>
          <p className="mt-3">
            <span className="font-heading text-4xl font-bold">$0</span>
            <span className="text-muted-foreground"> / forever</span>
          </p>
          <ul className="mt-6 space-y-3">
            {freeFeatures.map((feature) => (
              <Feature key={feature}>{feature}</Feature>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Premium plan */}
      <Card className={premium ? "border-primary" : "border-accent"}>
        <CardContent className="flex h-full flex-col p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold">
              <Crown className="h-5 w-5 text-accent-foreground" />
              Premium
            </h2>
            {premium && <Badge>Current plan</Badge>}
          </div>
          <p className="mt-3">
            <span className="font-heading text-4xl font-bold">
              {formatMoney(PREMIUM_PRICE_CENTS)}
            </span>
            <span className="text-muted-foreground"> / month</span>
          </p>
          <ul className="mt-6 space-y-3">
            {premiumFeatures.map((feature) => (
              <Feature key={feature}>{feature}</Feature>
            ))}
          </ul>

          <div className="mt-auto pt-6">
            {premium ? (
              <p className="rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
                Your Premium plan is active
                {user.subscriptionExpiresAt
                  ? ` until ${formatDate(user.subscriptionExpiresAt)}.`
                  : "."}
              </p>
            ) : (
              <>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading}
                  onClick={handleUpgrade}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Redirecting to Stripe..." : "Upgrade to Premium"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Secure payment by Stripe. Test mode only.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

