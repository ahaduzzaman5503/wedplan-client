import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getDashboardPath } from "@/lib/roles";
import PageLoader from "@/components/shared/PageLoader";

// Asks the Better Auth route for the session, forwarding the visitor's cookies.
// This page never opens its own MongoDB connection.
async function getSession() {
  const requestHeaders = await headers();
  const baseUrl = (process.env.BETTER_AUTH_URL || "").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie: requestHeaders.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Session check failed with status ${response.status}`);
  }

  // The route answers with { session, user }, or null when nobody is logged in
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function Guard({ roles, children }) {
  const data = await getSession();
  const user = data?.user;

  if (!user) {
    redirect("/sign-in");
  }

  if (user.isBlocked) {
    redirect("/blocked");
  }

  // If roles are given, the user's role must be one of them
  if (roles && !roles.includes(user.role)) {
    redirect(getDashboardPath(user.role));
  }

  return children;
}

// roles is optional: with no roles, any logged-in user can enter
export default function ProtectedArea({ roles, children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Guard roles={roles}>{children}</Guard>
    </Suspense>
  );
}