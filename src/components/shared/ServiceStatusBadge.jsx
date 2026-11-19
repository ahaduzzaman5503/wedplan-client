import { Badge } from "@/components/ui/badge";

const styles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ServiceStatusBadge({ status }) {
  return (
    <Badge className={`capitalize ${styles[status] ?? ""}`}>{status}</Badge>
  );
}

