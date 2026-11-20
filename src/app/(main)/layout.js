import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import NavbarFallback from "@/components/layout/NavbarFallback";
import Footer from "@/components/layout/Footer";

export default function MainLayout({ children }) {
  return (
    <>
      <Suspense fallback={<NavbarFallback />}>
        <Navbar />
      </Suspense>
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
    </>
  );
}

