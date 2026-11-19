"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ClipboardList,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatEventDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";

export default function CustomerOverview() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", bookings: [] });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    apiFetch("/api/bookings/mine")
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, error: "", bookings: result.bookings });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load your dashboard data",
            bookings: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { loading, error, bookings } = state;
  const count = (status) => bookings.filter((b) => b.status === status).length;
  const value = (number) => (loading ? null : number);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Here is a summary of your wedding booking requests.
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Total Requests"
          value={value(bookings.length)}
        />
        <StatCard
          icon={CalendarClock}
          label="Pending"
          value={value(count("pending"))}
        />
        <StatCard
          icon={CalendarCheck}
          label="Accepted"
          value={value(count("accepted"))}
        />
        <StatCard
          icon={CalendarX}
          label="Rejected"
          value={value(count("rejected"))}
        />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold">Recent requests</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/dashboard/customer/bookings" />}
            >
              View All
            </Button>
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              Browse Services
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}

          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              You have not sent any booking requests yet.
            </div>
          )}

          {!loading &&
            bookings.slice(0, 3).map((booking) => (
              <div
                key={booking._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {booking.service?.serviceName || "Service no longer available"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Event on {formatEventDate(booking.eventDate)}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

