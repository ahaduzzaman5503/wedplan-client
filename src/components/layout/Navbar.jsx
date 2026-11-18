"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

// Where each role goes for Dashboard and Profile Settings
const roleLinks = {
  admin: {
    dashboard: "/dashboard/admin",
    profile: "/dashboard/admin/profile",
  },
  vendor: {
    dashboard: "/dashboard/vendor",
    profile: "/dashboard/vendor/profile",
  },
  customer: {
    dashboard: "/dashboard/customer",
    profile: "/dashboard/customer/profile",
  },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function UserAvatar({ user, className }) {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={user?.image || undefined}
        alt={user?.name || "User"}
        referrerPolicy="no-referrer"
      />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(user?.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Real session from Better Auth. It updates automatically on sign in / sign out.
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const links = user ? roleLinks[user.role] ?? roleLinks.customer : null;

  const linkClass = (href) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      pathname === href ? "text-primary" : "text-muted-foreground"
    }`;

  const closeMenu = () => setOpen(false);

  const handleLogout = async () => {
    closeMenu();
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message || "Logout failed. Please try again.");
      return;
    }
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  console.log(user);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 fill-primary text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">
            WedPlan
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <Skeleton className="h-11 w-40 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border-2 p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <UserAvatar user={user} className="h-9 w-9" />
                <div className="min-w-0 text-left">
                  <span className="block max-w-32 truncate text-sm font-semibold">
                    {user.name}
                  </span>
                  <span className="block max-w-32 truncate text-xs font-medium capitalize text-primary">
                    {user.role}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-2">
                  <UserAvatar user={user} className="h-10 w-10" />
                  <p className="truncate text-sm font-semibold text-gray-600">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={links.dashboard} />}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href={links.profile} />}>
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                nativeButton={false}
                render={<Link href="/sign-in" />}
              >
                Sign In
              </Button>
              <Button nativeButton={false} render={<Link href="/sign-up" />}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="h-6 w-6" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading text-primary">
                  WedPlan
                </SheetTitle>
              </SheetHeader>

              <div className="mt-2 flex flex-col gap-4 px-4">
                {user && (
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
                    <UserAvatar user={user} className="h-11 w-11" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.name}
                      </p>
                      <p className="text-xs font-medium capitalize text-primary">
                        {user.role}
                      </p>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={linkClass(link.href)}
                  >
                    {link.label}
                  </Link>
                ))}

                <hr />

                {isPending ? (
                  <div className="space-y-3">
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ) : user ? (
                  <>
                    <Link
                      href={links.dashboard}
                      onClick={closeMenu}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      href={links.profile}
                      onClick={closeMenu}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                      <Settings className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      nativeButton={false}
                      render={<Link href="/sign-in" onClick={closeMenu} />}
                    >
                      Sign In
                    </Button>
                    <Button
                      nativeButton={false}
                      render={<Link href="/sign-up" onClick={closeMenu} />}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
