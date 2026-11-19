"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  CreditCard,
  Package,
  Store,
  User,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";

export default function AdminOverview() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", stats: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    apiFetch("/api/admin/stats")
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, error: "", stats: result.stats });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load platform statistics",
            stats: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { loading, error, stats } = state;
  const value = (key) => (loading || !stats ? null : stats[key]);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        {firstName ? `Welcome, ${firstName}` : "Admin Overview"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        A summary of everything happening on WedPlan.
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
          icon={Users}
          label="Total Registered Users"
          value={value("totalUsers")}
        />
        <StatCard icon={Store} label="Total Vendors" value={value("totalVendors")} />
        <StatCard
          icon={User}
          label="Total Customers"
          value={value("totalCustomers")}
        />
        <StatCard
          icon={Package}
          label="Total Services"
          value={value("totalServices")}
        />
        <StatCard
          icon={ClipboardCheck}
          label="Pending Services"
          value={value("pendingServices")}
          hint={
            stats?.pendingServices > 0 ? "Waiting for your review" : undefined
          }
        />
        <StatCard
          icon={CreditCard}
          label="Total Transactions"
          value={value("totalTransactions")}
        />
      </div>

      {stats?.pendingServices > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-secondary/50 p-4">
          <p className="text-sm text-muted-foreground">
            {stats.pendingServices}{" "}
            {stats.pendingServices === 1 ? "service is" : "services are"} waiting
            for approval. Customers cannot see them until you review them.
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/admin/services" />}
          >
            Review Services
          </Button>
        </div>
      )}
    </div>
  );
}

