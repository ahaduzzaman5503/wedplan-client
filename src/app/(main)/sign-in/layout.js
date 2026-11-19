import GuestOnly from "@/components/auth/GuestOnly";

export const metadata = {
  title: "Sign In | WedPlan",
};

export default function SignInLayout({ children }) {
  return <GuestOnly>{children}</GuestOnly>;
}

