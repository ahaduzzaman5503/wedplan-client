import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/roles";
import PageLoader from "@/components/shared/PageLoader";

async function Guard({ roles, children }) {
  // Real session check on the SERVER
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.isBlocked) {
    redirect("/blocked");
  }

  // If roles are given, the user's role must be one of them
  if (roles && !roles.includes(session.user.role)) {
    redirect(getDashboardPath(session.user.role));
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