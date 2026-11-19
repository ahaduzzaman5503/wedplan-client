"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/roles";
import PageLoader from "@/components/shared/PageLoader";

export default function GuestOnly({ children }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  useEffect(() => {
    if (user) router.replace(getDashboardPath(user.role));
  }, [user, router]);

  if (isPending) return <PageLoader />;
  if (user) return <PageLoader label="Redirecting to your dashboard..." />;

  return children;
}

