"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Loader2,
  PackageSearch,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceGallery from "@/components/services/ServiceGallery";
import ServiceStatusBadge from "@/components/shared/ServiceStatusBadge";
import UserAvatar from "@/components/shared/UserAvatar";

const PAGE_SIZE = 10;

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-64";

const ACTIONS = {
  approve: {
    title: "Approve this service?",
    confirm: "Yes, Approve",
    busy: "Approving...",
    variant: "default",
    describe: (s) =>
      `"${s.serviceName}" will become visible to customers on the Browse Services page.`,
  },
  reject: {
    title: "Reject this service?",
    confirm: "Yes, Reject",
    busy: "Rejecting...",
    variant: "destructive",
    describe: (s) =>
      `"${s.serviceName}" will be hidden from customers, and the vendor will see it as rejected.`,
  },
  delete: {
    title: "Delete this service?",
    confirm: "Yes, Delete",
    busy: "Deleting...",
    variant: "destructive",
    describe: (s) =>
      `"${s.serviceName}" will be permanently removed. Existing booking requests for it will show "Service no longer available". This cannot be undone.`,
  },
};

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default function ManageServices() {
  const silentRef = useRef(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    services: [],
    counts: null,
    pagination: null,
  });

  const [viewing, setViewing] = useState(null);
  const [action, setAction] = useState(null); // { type, service }
  const [busy, setBusy] = useState(false);

  // Wait until the admin stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    // After an action we refresh quietly, without flashing the skeleton
    const silent = silentRef.current;
    silentRef.current = false;
    if (!silent) {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
    }

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (category) params.set("category", category);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    apiFetch(`/api/admin/services?${params.toString()}`)
      .then((result) => {
        if (cancelled) return;
        // The last item of a later page was removed: go back one page
        if (result.services.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setState({
          loading: false,
          error: "",
          services: result.services,
          counts: result.counts,
          pagination: result.pagination,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Could not load services",
          services: [],
          pagination: null,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [search, status, category, page, attempt]);

  const { loading, error, services, counts, pagination } = state;

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const startAction = (type, service) => {
    setViewing(null);
    setAction({ type, service });
  };

  const handleConfirm = async () => {
    if (!action) return;
    const { type, service } = action;

    setBusy(true);
    try {
      const result =
        type === "delete"
          ? await apiFetch(`/api/admin/services/${service._id}`, {
              method: "DELETE",
            })
          : await apiFetch(`/api/admin/services/${service._id}/status`, {
              method: "PATCH",
              body: { status: type === "approve" ? "approved" : "rejected" },
            });

      toast.success(result.message || "Done");
      setAction(null);
      silentRef.current = true;
      setAttempt((value) => value + 1);
    } catch (err) {
      // For example: a Free vendor already has 3 active services (409)
      toast.error(err.message || "Could not complete this action");
      setAction(null);
    } finally {
      setBusy(false);
    }
  };

  const hasFilters = Boolean(search || status !== "all" || category);
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setCategory("");
    setPage(1);
  };

  const config = action ? ACTIONS[action.type] : null;

  return (
    <div>
      {/* Search and category */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <label htmlFor="service-search" className="sr-only">
            Search services
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="service-search"
            placeholder="Search by service or vendor name"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="service-category" className="sr-only">
            Category
          </label>
          <select
            id="service-category"
            className={selectClass}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => changeStatus(item.value)}
            aria-pressed={status === item.value}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              status === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {item.label}
            {counts ? ` (${counts[item.value]})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="text-muted-foreground">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setAttempt((v) => v + 1)}
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
            <PackageSearch className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              No services found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try different keywords or remove some filters."
                : "No services have been submitted yet."}
            </p>
            {hasFilters && (
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="hidden md:table-cell">Vendor</TableHead>
                    <TableHead className="hidden lg:table-cell">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex min-w-52 items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={service.images?.[0]}
                              alt={service.serviceName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {service.serviceName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {service.category} · {service.location}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="min-w-36">
                          <p className="truncate text-sm font-medium">
                            {service.vendor?.businessName ||
                              service.vendor?.name ||
                              "Vendor removed"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {service.vendor?.email}
                          </p>
                          {service.vendor?.isBlocked && (
                            <Badge className="mt-1 bg-red-100 text-red-800">
                              Vendor blocked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden font-medium text-primary lg:table-cell">
                        {formatPrice(service.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-start gap-1">
                          <ServiceStatusBadge status={service.status} />
                          {!service.isActive && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`View ${service.serviceName}`}
                            onClick={() => setViewing(service)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {service.status !== "approved" && (
                            <Button
                              size="sm"
                              onClick={() => startAction("approve", service)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="hidden sm:inline">Approve</span>
                            </Button>
                          )}
                          {service.status !== "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => startAction("reject", service)}
                            >
                              <X className="h-4 w-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Delete ${service.serviceName}`}
                            onClick={() => startAction("delete", service)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Details popup */}
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
                <ServiceStatusBadge status={viewing.status} />
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

              {viewing.vendor && (
                <div className="rounded-lg border p-4">
                  <p className="mb-3 text-sm font-semibold">Vendor</p>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={viewing.vendor} className="h-11 w-11" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {viewing.vendor.businessName || viewing.vendor.name}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {viewing.vendor.name} · {viewing.vendor.email}
                      </p>
                    </div>
                    <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                      {viewing.vendor.isPremium && (
                        <Badge className="gap-1 bg-accent text-accent-foreground">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                      {viewing.vendor.isBlocked && (
                        <Badge className="bg-red-100 text-red-800">Blocked</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <dl className="divide-y rounded-lg border px-4">
                <InfoRow label="Submitted">{formatDate(viewing.createdAt)}</InfoRow>
                <InfoRow label="Last updated">{formatDate(viewing.updatedAt)}</InfoRow>
              </dl>

              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => startAction("delete", viewing)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <div className="flex flex-wrap gap-2">
                  {viewing.status !== "rejected" && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={() => startAction("reject", viewing)}
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  {viewing.status !== "approved" && (
                    <Button onClick={() => startAction("approve", viewing)}>
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation popup */}
      <Dialog
        open={Boolean(action)}
        onOpenChange={(open) => !open && !busy && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config?.title}</DialogTitle>
            <DialogDescription>
              {action ? config.describe(action.service) : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setAction(null)}
            >
              Go Back
            </Button>
            <Button
              variant={config?.variant}
              disabled={busy}
              onClick={handleConfirm}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy ? config?.busy : config?.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}



