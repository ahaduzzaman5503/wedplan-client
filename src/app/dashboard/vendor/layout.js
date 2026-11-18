import ProtectedArea from "@/components/auth/ProtectedArea";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function Layout({ children }) {
  return (
    <ProtectedArea roles={["vendor"]}>
      <DashboardShell role="vendor">{children}</DashboardShell>
    </ProtectedArea>
  );
}
