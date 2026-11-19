"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

const TABS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const statusStyles = {
  paid: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};

function PaymentBadge({ status }) {
  return (
    <Badge className={`capitalize ${statusStyles[status] ?? "bg-gray-200 text-gray-700"}`}>
      {status}
    </Badge>
  );
}

export default function Transactions() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    transactions: [],
    pagination: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    apiFetch(`/api/admin/transactions?${params.toString()}`)
      .then((result) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: "",
            transactions: result.transactions,
            pagination: result.pagination,
          });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load transactions",
            transactions: [],
            pagination: null,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status, page, attempt]);

  const { loading, error, transactions, pagination } = state;

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
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

        {!loading && !error && transactions.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
            <ReceiptText className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              No transactions found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {status === "all"
                ? "Payments will appear here when vendors upgrade to Premium."
                : `There are no ${status} transactions.`}
            </p>
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="rounded-xl border bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="min-w-44">
                          <p className="truncate font-medium">
                            {transaction.vendor?.businessName ||
                              transaction.vendor?.name ||
                              "Vendor removed"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {transaction.vendor?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.plan}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatMoney(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell>
                        <PaymentBadge status={transaction.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

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
    </div>
  );
}



