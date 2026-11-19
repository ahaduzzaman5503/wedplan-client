"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Crown,
  Package,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate, formatEventDate } from "@/lib/format";
import { FREE_PLAN_ACTIVE_LIMIT, isPremiumUser } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";

export default function VendorOverview() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user;
  const premium = isPremiumUser(user);
  const firstName = user?.name?.split(" ")[0];

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    services: [],
    bookings: [],
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    Promise.all([apiFetch("/api/services/mine"), apiFetch("/api/bookings/vendor")])
      .then(([servicesResult, bookingsResult]) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            services: servicesResult.services,
            bookings: bookingsResult.bookings,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load your dashboard data",
            services: [],
            bookings: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { loading, error, services, bookings } = state;

  const activeCount = services.filter(
    (service) => service.isActive && service.status !== "rejected"
  ).length;
  const pendingRequests = bookings.filter((b) => b.status === "pending");
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;
  const value = (number) => (loading ? null : number);

  const planValue = sessionPending ? null : premium ? "Premium" : "Free";
  let planHint = "";
  if (!sessionPending) {
    if (premium) {
      planHint = user?.subscriptionExpiresAt
        ? `Active until ${formatDate(user.subscriptionExpiresAt)}`
        : "Unlimited active services";
    } else {
      planHint = loading
        ? ""
        : `${activeCount} of ${FREE_PLAN_ACTIVE_LIMIT} active services used`;
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Here is a summary of your services and booking requests.
      </p>

      {error && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAttempt((v) => v + 1)}
          >
            Try again
          </Button>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Package}
          label="Total Services"
          value={value(services.length)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Services"
          value={value(activeCount)}
        />
        <StatCard
          icon={CalendarClock}
          label="Pending Booking Requests"
          value={value(pendingRequests.length)}
        />
        <StatCard
          icon={CalendarCheck}
          label="Accepted Bookings"
          value={value(acceptedCount)}
        />
        <StatCard
          icon={Crown}
          label="Current Plan"
          value={planValue}
          hint={planHint}
        />
      </div>

      {!premium && !sessionPending && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/50 p-4">
          <p className="text-sm text-muted-foreground">
            Free vendors can have up to {FREE_PLAN_ACTIVE_LIMIT} active
            services. Upgrade to Premium for unlimited services.
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/vendor/subscription" />}
          >
            View Plans
          </Button>
        </div>
      )}

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">
            Pending requests
          </h2>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/vendor/bookings" />}
          >
            View All Requests
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}

          {!loading && !error && pendingRequests.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              You have no pending booking requests.
            </div>
          )}

          {!loading &&
            pendingRequests.slice(0, 3).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {booking.customer?.name || "Customer"}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {booking.service?.serviceName || "Service removed"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Event on {formatEventDate(booking.eventDate)}
                  </p>
                </div>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/dashboard/vendor/bookings" />}
                >
                  Review
                </Button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

