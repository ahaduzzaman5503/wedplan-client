import GuestOnly from "@/components/auth/GuestOnly";

export const metadata = {
  title: "Sign Up | WedPlan",
};

export default function SignUpLayout({ children }) {
  return <GuestOnly>{children}</GuestOnly>;
}

