"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceCardSkeleton from "@/components/services/ServiceCardSkeleton";
import Reveal from "@/components/shared/Reveal";

export default function FeaturedServices() {
  const [state, setState] = useState({
    loading: true,
    error: "",
    services: [],
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/services?limit=6", { auth: false })
      .then((result) => {
        if (!cancelled) {
          setState({ loading: false, error: "", services: result.services });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            loading: false,
            error: error.message || "Could not load services",
            services: [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ loading: true, error: "", services: [] });
    setAttempt((value) => value + 1);
  };

  const { loading, error, services } = state;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Featured Wedding Services
          </h2>
          <p className="mt-2 text-muted-foreground">
            Hand-picked services from our trusted vendors.
          </p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-8">
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
            <Button className="mt-4" variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && services.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No services are available yet. Please check back soon.
          </div>
        )}

        {!loading && !error && services.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service._id} delay={index * 0.08} className="h-full">
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
