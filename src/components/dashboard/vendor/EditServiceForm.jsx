"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { SearchX } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceForm from "@/components/dashboard/vendor/ServiceForm";

export default function EditServiceForm() {
  const { id } = useParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", service: null });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "", service: null });

    // The vendor's own list includes pending and rejected services too
    apiFetch("/api/services/mine")
      .then((result) => {
        if (cancelled) return;
        const service = result.services.find((item) => item._id === id) || null;
        setState({
          loading: false,
          error: service ? "" : "not-found",
          service,
        });
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load this service",
            service: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const { loading, error, service } = state;

  const handleUpdate = async (values) => {
    const result = await apiFetch(`/api/services/${id}`, {
      method: "PATCH",
      body: values,
    });
    toast.success(result.message || "Service updated successfully");
    router.push("/dashboard/vendor/services");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
        <SearchX className="h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Service not found
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This service does not exist, or it does not belong to your account.
        </p>
        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/dashboard/vendor/services" />}
        >
          Back to My Services
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-muted-foreground">{error}</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <ServiceForm
      initialService={service}
      submitLabel="Save Changes"
      onSubmit={handleUpdate}
      cancelHref="/dashboard/vendor/services"
    />
  );
}

