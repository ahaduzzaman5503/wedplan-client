import ProtectedArea from "@/components/auth/ProtectedArea";

export default function Layout({ children }) {
  return <ProtectedArea roles={["admin"]}>{children}</ProtectedArea>;
}
