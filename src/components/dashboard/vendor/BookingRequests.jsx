"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  X,
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
        <div key={index} className="space-y-3 rounded-xl border bg-card p-5">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-56" />
        </div>
      ))}
    </div>
  );
}

export default function BookingRequests() {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ loading: true, error: "", bookings: [] });
  const [tab, setTab] = useState("all");
  const [viewing, setViewing] = useState(null);
  const [deciding, setDeciding] = useState(null); // { booking, status }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    apiFetch("/api/bookings/vendor")
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, error: "", bookings: result.bookings });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load booking requests",
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

  const startDecision = (booking, status) => {
    setViewing(null);
    setDeciding({ booking, status });
  };

  const handleDecision = async () => {
    if (!deciding) return;
    const { booking, status } = deciding;

    setBusy(true);
    try {
      const result = await apiFetch(`/api/bookings/${booking._id}/status`, {
        method: "PATCH",
        body: { status },
      });
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.map((item) =>
          item._id === booking._id ? { ...item, status } : item
        ),
      }));
      toast.success(result.message || `Booking request ${status}`);
      setDeciding(null);
    } catch (err) {
      toast.error(err.message || "Could not update this request");
      setDeciding(null);
      // The request may have changed (for example the customer cancelled it)
      if (err.status === 409) setAttempt((value) => value + 1);
    } finally {
      setBusy(false);
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
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          No booking requests yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          When customers request your services, they will appear here.
        </p>
      </div>
    );
  }

  const accepting = deciding?.status === "accepted";

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
          {visible.map((booking) => (
            <div key={booking._id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar user={booking.customer} className="h-11 w-11" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {booking.customer?.name || "Customer"}
                    </p>
                    {booking.customer?.email && (
                      <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {booking.customer.email}
                      </p>
                    )}
                  </div>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>

              <div className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">
                    {booking.service?.serviceName ||
                      "Service no longer available"}
                  </p>
                </div>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                  {formatEventDate(booking.eventDate)}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{booking.eventLocation}</span>
                </p>
              </div>

              {booking.message && (
                <p className="mt-4 line-clamp-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  &ldquo;{booking.message}&rdquo;
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="mr-auto text-xs text-muted-foreground">
                  Requested on {formatDate(booking.createdAt)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewing(booking)}
                >
                  <Eye className="h-4 w-4" />
                  Details
                </Button>
                {booking.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => startDecision(booking, "rejected")}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => startDecision(booking, "accepted")}
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
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
                  Booking Request
                </DialogTitle>
                <DialogDescription>
                  Received on {formatDate(viewing.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3">
                <UserAvatar user={viewing.customer} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {viewing.customer?.name || "Customer"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {viewing.customer?.email}
                  </p>
                </div>
                <div className="ml-auto">
                  <BookingStatusBadge status={viewing.status} />
                </div>
              </div>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Service</dt>
                  <dd className="text-right font-medium">
                    {viewing.service?.serviceName ||
                      "Service no longer available"}
                  </dd>
                </div>
                {viewing.service?.price != null && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service price</dt>
                    <dd className="font-medium">
                      {formatPrice(viewing.service.price)}
                    </dd>
                  </div>
                )}
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
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="font-medium">{formatDate(viewing.updatedAt)}</dd>
                </div>
              </dl>

              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Customer message
                </p>
                <p className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm">
                  {viewing.message || "No message provided."}
                </p>
              </div>

              {viewing.status === "pending" && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => startDecision(viewing, "rejected")}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => startDecision(viewing, "accepted")}>
                    <Check className="h-4 w-4" />
                    Accept
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept / reject confirmation popup */}
      <Dialog
        open={Boolean(deciding)}
        onOpenChange={(open) => !open && !busy && setDeciding(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accepting ? "Accept this request?" : "Reject this request?"}
            </DialogTitle>
            <DialogDescription>
              {deciding
                ? `${accepting ? "Accept" : "Reject"} the booking request from ${
                    deciding.booking.customer?.name || "this customer"
                  } for ${formatEventDate(deciding.booking.eventDate)}. This decision is final and cannot be changed later.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeciding(null)}
            >
              Go Back
            </Button>
            <Button
              variant={accepting ? "default" : "destructive"}
              disabled={busy}
              onClick={handleDecision}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy
                ? "Saving..."
                : accepting
                  ? "Yes, Accept"
                  : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

