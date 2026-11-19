"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  UserX,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
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
import UserAvatar from "@/components/shared/UserAvatar";

const PAGE_SIZE = 10;

const TABS = [
  { value: "all", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "vendor", label: "Vendors" },
  { value: "admin", label: "Admins" },
];

const roleStyles = {
  admin: "bg-primary text-primary-foreground",
  vendor: "bg-accent text-accent-foreground",
  customer: "bg-secondary text-secondary-foreground",
};

function RoleBadge({ role }) {
  return <Badge className={`capitalize ${roleStyles[role] ?? ""}`}>{role}</Badge>;
}

function StatusBadge({ isBlocked }) {
  return isBlocked ? (
    <Badge className="bg-red-100 text-red-800">Blocked</Badge>
  ) : (
    <Badge className="bg-green-100 text-green-800">Active</Badge>
  );
}

function CountBox({ label, value }) {
  return (
    <div className="rounded-lg bg-muted p-3 text-center">
      <p className="font-heading text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function UserDetailsDialog({ userId, onClose, onBlockRequest, currentUserId }) {
  const [state, setState] = useState({
    loading: true,
    error: "",
    user: null,
    activity: null,
  });

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setState({ loading: true, error: "", user: null, activity: null });

    apiFetch(`/api/admin/users/${userId}`)
      .then((result) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            user: result.user,
            activity: result.activity,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load user details",
            user: null,
            activity: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const { loading, error, user, activity } = state;

  return (
    <Dialog open={Boolean(userId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">User Details</DialogTitle>
          <DialogDescription>Profile information and activity.</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!loading && error && (
          <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!loading && user && (
          <>
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="h-14 w-14" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
                <div className="mt-1 flex gap-2">
                  <RoleBadge role={user.role} />
                  <StatusBadge isBlocked={user.isBlocked} />
                </div>
              </div>
            </div>

            <dl className="divide-y rounded-lg border px-4">
              {user.businessName && (
                <InfoRow label="Business">{user.businessName}</InfoRow>
              )}
              <InfoRow label="Phone">{user.phone || "Not provided"}</InfoRow>
              <InfoRow label="Address">{user.address || "Not provided"}</InfoRow>
              {user.role === "vendor" && (
                <InfoRow label="Plan">
                  <span className="capitalize">{user.subscriptionPlan}</span>
                  {user.subscriptionExpiresAt &&
                    ` (until ${formatDate(user.subscriptionExpiresAt)})`}
                </InfoRow>
              )}
              <InfoRow label="Joined">{formatDate(user.createdAt)}</InfoRow>
            </dl>

            {user.role === "vendor" && activity?.services && (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">Services</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    <CountBox label="Total" value={activity.services.total} />
                    <CountBox label="Active" value={activity.services.active} />
                    <CountBox label="Pending" value={activity.services.pending} />
                    <CountBox label="Approved" value={activity.services.approved} />
                    <CountBox label="Rejected" value={activity.services.rejected} />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">
                    Booking requests received
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    <CountBox label="Total" value={activity.bookingsReceived.total} />
                    <CountBox label="Pending" value={activity.bookingsReceived.pending} />
                    <CountBox label="Accepted" value={activity.bookingsReceived.accepted} />
                    <CountBox label="Rejected" value={activity.bookingsReceived.rejected} />
                    <CountBox label="Cancelled" value={activity.bookingsReceived.cancelled} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payments made: {activity.transactions}
                </p>
              </div>
            )}

            {user.role === "customer" && activity?.bookingsMade && (
              <div>
                <p className="mb-2 text-sm font-semibold">Booking requests made</p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <CountBox label="Total" value={activity.bookingsMade.total} />
                  <CountBox label="Pending" value={activity.bookingsMade.pending} />
                  <CountBox label="Accepted" value={activity.bookingsMade.accepted} />
                  <CountBox label="Rejected" value={activity.bookingsMade.rejected} />
                  <CountBox label="Cancelled" value={activity.bookingsMade.cancelled} />
                </div>
              </div>
            )}

            <DialogFooter>
              {user.role === "admin" ? (
                <p className="text-sm text-muted-foreground">
                  Admin accounts cannot be blocked.
                </p>
              ) : user.id === currentUserId ? null : user.isBlocked ? (
                <Button onClick={() => onBlockRequest(user, false)}>
                  <CheckCircle2 className="h-4 w-4" />
                  Unblock User
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => onBlockRequest(user, true)}
                >
                  <Ban className="h-4 w-4" />
                  Block User
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ManageUsers() {
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    users: [],
    counts: null,
    pagination: null,
  });

  const [viewingId, setViewingId] = useState(null);
  const [blocking, setBlocking] = useState(null); // { user, isBlocked }
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
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (role !== "all") params.set("role", role);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    apiFetch(`/api/admin/users?${params.toString()}`)
      .then((result) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          users: result.users,
          counts: result.counts,
          pagination: result.pagination,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || "Could not load users",
          users: [],
          pagination: null,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [search, role, page, attempt]);

  const { loading, error, users, counts, pagination } = state;

  const changeRole = (value) => {
    setRole(value);
    setPage(1);
  };

  const startBlock = (user, isBlocked) => {
    setViewingId(null);
    setBlocking({ user, isBlocked });
  };

  const handleBlock = async () => {
    if (!blocking) return;
    const { user, isBlocked } = blocking;

    setBusy(true);
    try {
      const result = await apiFetch(`/api/admin/users/${user.id}/block`, {
        method: "PATCH",
        body: { isBlocked },
      });
      setState((prev) => ({
        ...prev,
        users: prev.users.map((item) =>
          item.id === user.id ? { ...item, isBlocked } : item
        ),
      }));
      toast.success(result.message);
      setBlocking(null);
    } catch (err) {
      toast.error(err.message || "Could not update this user");
      setBlocking(null);
    } finally {
      setBusy(false);
    }
  };

  const hasFilters = Boolean(search || role !== "all");
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setRole("all");
    setPage(1);
  };

  return (
    <div>
      {/* Search */}
      <div className="relative max-w-md">
        <label htmlFor="user-search" className="sr-only">
          Search users by name or email
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="user-search"
          placeholder="Search by name or email"
          className="pl-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Role tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => changeRole(item.value)}
            aria-pressed={role === item.value}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              role === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {item.label}
            {counts ? ` (${counts[item.value === "all" ? "all" : item.value]})` : ""}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
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

        {!loading && !error && users.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
            <UserX className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              No users found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or role filter.
            </p>
            {hasFilters && (
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUserId;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex min-w-48 items-center gap-3">
                            <UserAvatar user={user} className="h-9 w-9" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {user.name}
                                {isSelf && (
                                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge isBlocked={user.isBlocked} />
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingId(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                            {user.role !== "admin" &&
                              !isSelf &&
                              (user.isBlocked ? (
                                <Button
                                  size="sm"
                                  onClick={() => startBlock(user, false)}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Unblock</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => startBlock(user, true)}
                                >
                                  <Ban className="h-4 w-4" />
                                  <span className="hidden sm:inline">Block</span>
                                </Button>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <UserDetailsDialog
        userId={viewingId}
        onClose={() => setViewingId(null)}
        onBlockRequest={startBlock}
        currentUserId={currentUserId}
      />

      {/* Block / unblock confirmation */}
      <Dialog
        open={Boolean(blocking)}
        onOpenChange={(open) => !open && !busy && setBlocking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {blocking?.isBlocked ? "Block this user?" : "Unblock this user?"}
            </DialogTitle>
            <DialogDescription>
              {blocking?.isBlocked
                ? `${blocking?.user.name} will not be able to sign in or use protected features. If this is a vendor, their services will be hidden from customers.`
                : `${blocking?.user.name} will be able to sign in and use the platform again.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setBlocking(null)}
            >
              Go Back
            </Button>
            <Button
              variant={blocking?.isBlocked ? "destructive" : "default"}
              disabled={busy}
              onClick={handleBlock}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {busy
                ? "Saving..."
                : blocking?.isBlocked
                  ? "Yes, Block"
                  : "Yes, Unblock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

