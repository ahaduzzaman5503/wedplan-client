import { Badge } from "@/components/ui/badge";

const styles = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-200 text-gray-700",
};

export default function BookingStatusBadge({ status }) {
  return (
    <Badge className={`capitalize ${styles[status] ?? ""}`}>{status}</Badge>
  );
}

