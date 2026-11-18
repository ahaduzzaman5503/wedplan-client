import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlaceholderPage({
  title,
  description = "This page will be built in a later step.",
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Button
        className="mt-6"
        variant="outline"
        nativeButton={false}
        render={<Link href="/" />}
      >
        Back to Home
      </Button>
    </div>
  );
}