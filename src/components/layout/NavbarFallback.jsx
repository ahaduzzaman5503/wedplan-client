import Link from "next/link";
import { Heart } from "lucide-react";

// Shown for a split second while the real Navbar loads
export default function NavbarFallback() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-primary text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">
            WedPlan
          </span>
        </Link>
      </div>
    </header>
  );
}

