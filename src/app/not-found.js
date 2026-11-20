import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NavbarFallback from "@/components/layout/NavbarFallback";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="font-heading text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sorry, the page you are looking for does not exist or may have been
          moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Button nativeButton={false} render={<Link href="/" />}>
            Go Home
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/services" />}
          >
            Browse Services
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}

