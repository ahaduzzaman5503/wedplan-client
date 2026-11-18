"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Crown, MapPin, SearchX } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/shared/UserAvatar";
import ServiceGallery from "@/components/services/ServiceGallery";

function DetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-6 h-6 w-40" />
      <Skeleton className="mt-3 h-10 w-2/3" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ title, message, onRetry }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <SearchX className="h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 font-heading text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <div className="mt-6 flex gap-3">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button nativeButton={false} render={<Link href="/services" />}>
          Browse Services
        </Button>
      </div>
    </div>
  );
}

function BookingPanel({ service, user, sessionPending }) {
  if (sessionPending) {
    return <Skeleton className="h-10 w-full" />;
  }

  let message = "";
  if (user?.role === "admin") {
    message = "Admin accounts cannot submit booking requests.";
  } else if (user?.role === "vendor") {
    message =
      user.id === service.vendor.id
        ? "This is your own service, so you cannot book it."
        : "Vendor accounts cannot submit booking requests. Please use a customer account.";
  }

  if (message) {
    return (
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        {message}
      </p>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={() => toast.info("The booking form will be added in the next steps")}
    >
      Request Booking
    </Button>
  );
}

export default function ServiceDetails() {
  const { id } = useParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const user = session?.user ?? null;

  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    loading: true,
    service: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, service: null, error: null });

    apiFetch(`/api/services/${id}`, { auth: false })
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, service: result.service, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            service: null,
            error: { status: error.status, message: error.message },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const { loading, service, error } = state;

  if (loading) return <DetailsSkeleton />;

  if (error) {
    if (error.status === 400) {
      return (
        <ErrorState
          title="Invalid service link"
          message="This service ID is not valid. Please check the link and try again."
        />
      );
    }
    if (error.status === 404) {
      return (
        <ErrorState
          title="Service not found"
          message="This service does not exist or is no longer available."
        />
      );
    }
    return (
      <ErrorState
        title="Something went wrong"
        message={error.message || "Could not load this service."}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    );
  }

  const vendorName = service.vendor.businessName || service.vendor.name;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to services
      </Link>

      <div className="mt-6">
        <Badge variant="secondary">{service.category}</Badge>
        <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
          {service.serviceName}
        </h1>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ServiceGallery images={service.images} name={service.serviceName} />

          <div>
            <h2 className="font-heading text-2xl font-semibold">
              About this service
            </h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
              {service.description}
            </p>
          </div>
        </div>

        <aside>
          <div className="space-y-5 rounded-xl border bg-card p-6 lg:sticky lg:top-24">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-heading text-3xl font-bold text-primary">
                {formatPrice(service.price)}
              </p>
            </div>

            <p className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {service.location}
            </p>

            <div className="border-t pt-5">
              <p className="mb-3 text-sm text-muted-foreground">Offered by</p>
              <div className="flex items-center gap-3">
                <UserAvatar
                  user={{
                    name: service.vendor.name,
                    image: service.vendor.image,
                  }}
                  className="h-11 w-11"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{vendorName}</p>
                  {service.vendor.businessName && (
                    <p className="truncate text-sm text-muted-foreground">
                      {service.vendor.name}
                    </p>
                  )}
                </div>
                {service.vendor.isPremium && (
                  <Badge className="ml-auto shrink-0 gap-1 bg-accent text-accent-foreground">
                    <Crown className="h-3 w-3" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-t pt-5">
              <BookingPanel
                service={service}
                user={user}
                sessionPending={sessionPending}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

