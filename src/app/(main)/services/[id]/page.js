import ProtectedArea from "@/components/auth/ProtectedArea";
import PlaceholderPage from "@/components/shared/PlaceholderPage";

export default function Page() {
  return (
    <ProtectedArea>
      <PlaceholderPage title="Service Details" />
    </ProtectedArea>
  );
}
