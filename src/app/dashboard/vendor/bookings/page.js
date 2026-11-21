import BookingRequests from "@/components/dashboard/vendor/BookingRequests";

export const metadata = {
  title: "Booking Requests | WedPlan",
};

export default function BookingRequestsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Booking Requests
      </h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Review requests from customers and accept or reject the pending ones.
      </p>
      <BookingRequests />
    </div>
  );
}