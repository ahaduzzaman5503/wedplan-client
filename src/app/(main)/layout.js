import Navbar from "../../components/layout/Navbar.jsx";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
    </>
  );
}
