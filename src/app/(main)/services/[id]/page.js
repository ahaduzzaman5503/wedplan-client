import ProtectedArea from "@/components/auth/ProtectedArea";
import ServiceDetails from "@/components/services/ServiceDetails";

export const metadata = {
  title: "Service Details | WedPlan",
};

export default function ServiceDetailsPage() {
  return (
    <ProtectedArea>
      <ServiceDetails />
    </ProtectedArea>
  );
}
