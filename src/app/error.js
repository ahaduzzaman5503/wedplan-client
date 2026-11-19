"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <TriangleAlert className="h-14 w-14 text-destructive" />
      <h1 className="mt-4 font-heading text-3xl font-semibold">
        Something went wrong
      </h1>
      <p className="mt-3 text-muted-foreground">
        An unexpected error happened. You can try again, or go back to the home
        page.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}

