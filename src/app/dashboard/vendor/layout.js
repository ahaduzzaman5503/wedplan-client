import ProtectedArea from "@/components/auth/ProtectedArea";

export default function Layout({ children }) {
  return <ProtectedArea roles={["vendor"]}>{children}</ProtectedArea>;
}
