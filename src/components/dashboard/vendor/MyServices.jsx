"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Eye,
  Loader2,
  MapPin,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { FREE_PLAN_ACTIVE_LIMIT, isPremiumUser } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceGallery from "@/components/services/ServiceGallery";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status }) {
  return (
    <Badge className={`capitalize ${statusStyles[status] ?? ""}`}>
      {status}
    </Badge>
  );
}

// A small on/off switch (no extra library needed)
function AvailabilitySwitch({ checked, disabled, busy, onToggle, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled || busy}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      {busy ? (
        <Loader2 className="mx-auto h-4 w-4 animate-spin text-white" />
      ) : (
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      )}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row"
        >
          <Skeleton className="aspect-[4/3] w-full sm:w-44" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full sm:w-72" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyServices() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const premium = isPremiumUser(session?.user);

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", services: [] });
  const [busyId, setBusyId] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, error: "", services: [] });

    apiFetch("/api/services/mine")
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, error: "", services: result.services });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load your services",
            services: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { loading, error, services } = state;

  const setServices = (updater) =>
    setState((prev) => ({ ...prev, services: updater(prev.services) }));

  const activeCount = services.filter(
    (service) => service.isActive && service.status !== "rejected"
  ).length;

  const handleToggle = async (service) => {
    setBusyId(service._id);
    try {
      const result = await apiFetch(`/api/services/${service._id}/availability`, {
        method: "PATCH",
        body: { isActive: !service.isActive },
      });
      setServices((list) =>
        list.map((item) =>
          item._id === service._id ? { ...item, isActive: result.isActive } : item
        )
      );
      toast.success(result.message);
    } catch (err) {
      if (err.status === 403 && /free plan/i.test(err.message)) {
        toast.error(err.message, {
          action: {
            label: "Upgrade",
            onClick: () => router.push("/dashboard/vendor/subscription"),
          },
        });
      } else {
        toast.error(err.message || "Could not update availability");
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const result = await apiFetch(`/api/services/${deleting._id}`, {
        method: "DELETE",
      });
      setServices((list) => list.filter((item) => item._id !== deleting._id));
      toast.success(result.message || "Service deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err.message || "Could not delete this service");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) return <ListSkeleton />;

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

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
        <PackageOpen className="h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          You have not added any services yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first service so customers can find you.
        </p>
        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/dashboard/vendor/add-service" />}
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {premium
          ? `Active services: ${activeCount} (Premium: unlimited)`
          : `Active services: ${activeCount} / ${FREE_PLAN_ACTIVE_LIMIT} (Free plan)`}
      </p>

      <div className="space-y-4">
        {services.map((service) => {
          const rejected = service.status === "rejected";
          return (
            <div
              key={service._id}
              className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row"
            >
              <div className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.images?.[0]}
                  alt={service.serviceName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={service.status} />
                  {!service.isActive && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                  <Badge variant="secondary">{service.category}</Badge>
                </div>

                <h3 className="font-heading text-lg font-semibold leading-snug">
                  {service.serviceName}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {formatPrice(service.price)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    {service.location}
                  </span>
                </div>

                {rejected && (
                  <p className="text-xs text-destructive">
                    Rejected by admin. This service is not visible to customers.
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <AvailabilitySwitch
                      checked={service.isActive}
                      disabled={rejected}
                      busy={busyId === service._id}
                      onToggle={() => handleToggle(service)}
                      label={`Toggle availability for ${service.serviceName}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      {service.isActive ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="flex gap-2 sm:ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewing(service)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/dashboard/vendor/services/${service._id}/edit`}
                        />
                      }
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(service)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View details popup */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  {viewing.serviceName}
                </DialogTitle>
                <DialogDescription>
                  {viewing.category} · {viewing.location}
                </DialogDescription>
              </DialogHeader>

              <ServiceGallery images={viewing.images} name={viewing.serviceName} />

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={viewing.status} />
                <Badge variant="outline">
                  {viewing.isActive ? "Available" : "Unavailable"}
                </Badge>
                <span className="ml-auto text-xl font-bold text-primary">
                  {formatPrice(viewing.price)}
                </span>
              </div>

              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {viewing.description}
              </p>

              <p className="text-xs text-muted-foreground">
                Created {new Date(viewing.createdAt).toLocaleDateString()} · Last
                updated {new Date(viewing.updatedAt).toLocaleDateString()}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation popup */}
      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && !deleteBusy && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this service?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `"${deleting.serviceName}" will be permanently removed. This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={deleteBusy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteBusy}
              onClick={handleDelete}
            >
              {deleteBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteBusy ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

