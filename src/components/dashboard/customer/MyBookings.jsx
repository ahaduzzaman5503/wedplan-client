"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarDays,
  CalendarX,
  Eye,
  Loader2,
  MapPin,
  Store,
  XCircle,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDate, formatEventDate, formatPrice } from "@/lib/format";
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
import BookingStatusBadge from "@/components/shared/BookingStatusBadge";
import UserAvatar from "@/components/shared/UserAvatar";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

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
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceImage({ src, name, className }) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}
      >
        <CalendarX className="h-8 w-8" />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-muted ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

export default function MyBookings() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", bookings: [] });
  const [tab, setTab] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [cancelBusy, setCancelBusy] = useState(false);

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
            error: error.message || "Could not load your bookings",
            bookings: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const { loading, error, bookings } = state;

  const counts = { all: bookings.length };
  TABS.slice(1).forEach((item) => {
    counts[item.value] = bookings.filter((b) => b.status === item.value).length;
  });

  const visible =
    tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  const handleCancel = async () => {
    if (!cancelling) return;
    setCancelBusy(true);
    try {
      const result = await apiFetch(`/api/bookings/${cancelling._id}/cancel`, {
        method: "PATCH",
      });
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) =>
          b._id === cancelling._id ? { ...b, status: "cancelled" } : b
        ),
      }));
      toast.success(result.message || "Booking request cancelled");
      setCancelling(null);
    } catch (err) {
      toast.error(err.message || "Could not cancel this request");
      setCancelling(null);
      // The status may have changed (for example the vendor just accepted it)
      if (err.status === 409) setAttempt((value) => value + 1);
    } finally {
      setCancelBusy(false);
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

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
        <CalendarX className="h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          You have no booking requests yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Find a service you like and send your first request.
        </p>
        <Button
          className="mt-4"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          Browse Services
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            aria-pressed={tab === item.value}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {item.label} ({counts[item.value]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          No {tab} booking requests.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((booking) => {
            const service = booking.service;
            const serviceMissing = !service?.serviceName;
            const vendorName =
              booking.vendor?.businessName || booking.vendor?.name;

            return (
              <div
                key={booking._id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row"
              >
                <ServiceImage
                  src={service?.image}
                  name={service?.serviceName || "Service"}
                  className="aspect-[4/3] w-full shrink-0 rounded-lg sm:w-44"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookingStatusBadge status={booking.status} />
                    <span className="text-xs text-muted-foreground">
                      Requested on {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-semibold leading-snug">
                    {serviceMissing
                      ? "Service no longer available"
                      : service.serviceName}
                  </h3>

                  <div className="grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                      {formatEventDate(booking.eventDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">{booking.eventLocation}</span>
                    </p>
                    {vendorName && (
                      <p className="flex items-center gap-2 sm:col-span-2">
                        <Store className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate">{vendorName}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewing(booking)}
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    {booking.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setCancelling(booking)}
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details popup */}
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {viewing && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-xl">
                  Booking Details
                </DialogTitle>
                <DialogDescription>
                  Request sent on {formatDate(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3">
                <ServiceImage
                  src={viewing.service?.image}
                  name={viewing.service?.serviceName || "Service"}
                  className="h-16 w-20 shrink-0 rounded-lg"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {viewing.service?.serviceName ||
                      "Service no longer available"}
                  </p>
                  {viewing.service?.serviceName && (
                    <p className="text-sm text-muted-foreground">
                      {viewing.service.category} ·{" "}
                      {formatPrice(viewing.service.price)}
                    </p>
                  )}
                </div>
                <div className="ml-auto">
                  <BookingStatusBadge status={viewing.status} />
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Event date</dt>
                  <dd className="font-medium">
                    {formatEventDate(viewing.eventDate)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Event location</dt>
                  <dd className="text-right font-medium">
                    {viewing.eventLocation}
                  </dd>
                </div>
                {viewing.vendor && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd className="flex items-center gap-2 font-medium">
                      <UserAvatar
                        user={viewing.vendor}
                        className="h-6 w-6"
                      />
                      {viewing.vendor.businessName || viewing.vendor.name}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="font-medium">{formatDate(viewing.updatedAt)}</dd>
                </div>
              </dl>

              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Your message
                </p>
                <p className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm">
                  {viewing.message || "No message provided."}
                </p>
              </div>

              <DialogFooter>
                {viewing.service?.serviceName && (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/services/${viewing.service._id}`} />}
                  >
                    View Service
                  </Button>
                )}
                {viewing.status === "pending" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setCancelling(viewing);
                      setViewing(null);
                    }}
                  >
                    Cancel Request
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation popup */}
      <Dialog
        open={Boolean(cancelling)}
        onOpenChange={(open) => !open && !cancelBusy && setCancelling(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking request?</DialogTitle>
            <DialogDescription>
              {cancelling?.service?.serviceName
                ? `Your request for "${cancelling.service.serviceName}" on ${formatEventDate(cancelling.eventDate)} will be cancelled.`
                : "This booking request will be cancelled."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={cancelBusy}
              onClick={() => setCancelling(null)}
            >
              Keep Request
            </Button>
            <Button
              variant="destructive"
              disabled={cancelBusy}
              onClick={handleCancel}
            >
              {cancelBusy && <Loader2 className="h-4 w-4 animate-spin" />}
              {cancelBusy ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



