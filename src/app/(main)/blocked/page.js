"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function BlockedPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="h-14 w-14 text-destructive" />
      <h1 className="mt-4 font-heading text-3xl font-semibold">
        Your account has been blocked
      </h1>
      <p className="mt-3 text-muted-foreground">
        You cannot access WedPlan features right now. Please contact support if
        you think this is a mistake.
      </p>
      <Button className="mt-8" variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}