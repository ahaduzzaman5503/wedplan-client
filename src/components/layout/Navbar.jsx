"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, LayoutDashboard, LogOut, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
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

// TEMPORARY: design testing only.
// true  -> logged-in navbar (change role to "admin" | "vendor" | "customer")
// false -> logged-out navbar
const IS_LOGGED_IN = true;
const MOCK_USER = {
  name: "Rahim Uddin",
  email: "rahim@gmail.com",
  image: "",
  role: "vendor",
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
      <AvatarImage src={user.image} alt={user.name} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Later this will come from Better Auth (useSession)
  const user = IS_LOGGED_IN ? MOCK_USER : null;
  const links = user ? roleLinks[user.role] : null;

  const linkClass = (href) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      pathname === href ? "text-primary" : "text-muted-foreground"
    }`;

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    // Later: call Better Auth signOut here
    closeMenu();
    toast.success("Logged out successfully");
  };

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border-2 p-1 pr-3 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <UserAvatar user={user} className="h-9 w-9 " />
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
                  <p className="truncate text-sm text-gray-600 font-semibold">
                    {user?.email}
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
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>
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

                {user ? (
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
