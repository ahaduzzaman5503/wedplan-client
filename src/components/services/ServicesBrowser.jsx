"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, SearchX, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceCardSkeleton from "@/components/services/ServiceCardSkeleton";

const PAGE_SIZE = 9;

const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function ServicesBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters come from the URL
  const rawCategory = searchParams.get("category") || "";
  const category = SERVICE_CATEGORIES.includes(rawCategory) ? rawCategory : "";
  const search = searchParams.get("search") || "";
  const location = searchParams.get("location") || "";
  const rawSort = searchParams.get("sort") || "";
  const sort = ["price_asc", "price_desc"].includes(rawSort) ? rawSort : "";
  const page = Math.max(parseInt(searchParams.get("page"), 10) || 1, 1);

  const [searchInput, setSearchInput] = useState(search);
  const [locations, setLocations] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    error: "",
    services: [],
    pagination: null,
  });

  // Changes the URL. Any filter change goes back to page 1.
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
      else params.delete(key);
    });
    if (!("page" in updates)) params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  // Wait until the user stops typing, then update the URL
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;
    const timer = setTimeout(() => updateParams({ search: trimmed }), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Load the location list once
  useEffect(() => {
    apiFetch("/api/services/locations", { auth: false })
      .then((result) => setLocations(result.locations || []))
      .catch(() => {});
  }, []);

  // Load the services whenever a filter changes
  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: "" }));

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));

    apiFetch(`/api/services?${params.toString()}`, { auth: false })
      .then((result) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: "",
          services: result.services,
          pagination: result.pagination,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          loading: false,
          error: error.message || "Could not load services",
          services: [],
          pagination: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, location, sort, page, attempt]);

  const clearFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const goToPage = (nextPage) => {
    updateParams({ page: nextPage > 1 ? nextPage : "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasFilters = Boolean(search || category || location || sort);
  const locationOptions =
    location && !locations.includes(location) ? [location, ...locations] : locations;
  const { loading, error, services, pagination } = state;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">
          Browse Wedding Services
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search, filter and compare services from trusted vendors.
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <label htmlFor="search" className="sr-only">
            Search services by name
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by service name"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category" className="sr-only">
            Category
          </label>
          <select
            id="category"
            className={selectClass}
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
          >
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="sr-only">
            Location
          </label>
          <select
            id="location"
            className={selectClass}
            value={location}
            onChange={(e) => updateParams({ location: e.target.value })}
          >
            <option value="">All locations</option>
            {locationOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="sr-only">
            Sort by price
          </label>
          <select
            id="sort"
            className={selectClass}
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
          >
            <option value="">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Result count and clear button */}
      <div className="mt-4 flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {!loading && !error && pagination
            ? `${pagination.total} ${pagination.total === 1 ? "service" : "services"} found`
            : ""}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="mt-4">
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
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
        )}

        {!loading && !error && services.length === 0 && (
          <div className="flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              No services found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try different keywords or remove some filters.
            </p>
            {hasFilters && (
              <Button className="mt-4" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && pagination && pagination.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
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
            onClick={() => goToPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
