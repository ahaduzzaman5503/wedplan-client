import MyBookings from "@/components/dashboard/customer/MyBookings";

export const metadata = {
  title: "My Bookings | WedPlan",
};

export default function MyBookingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        My Bookings
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Track your booking requests and cancel the ones that are still pending.
      </p>
      <MyBookings />
    </div>
  );
}


