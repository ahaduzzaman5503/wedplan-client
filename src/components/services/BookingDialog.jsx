"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Today's date in the user's own time zone, as YYYY-MM-DD
function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  return formatLocalDate(new Date());
}

function getMaxDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  return formatLocalDate(date);
}

function validate(values) {
  const errors = {};

  if (!values.eventDate) {
    errors.eventDate = "Please choose your event date";
  } else if (values.eventDate < getToday()) {
    errors.eventDate = "Event date cannot be in the past";
  } else if (values.eventDate > getMaxDate()) {
    errors.eventDate = "Event date is too far in the future";
  }

  const location = values.eventLocation.trim();
  if (location.length < 2 || location.length > 200) {
    errors.eventLocation = "Event location must be 2 to 200 characters";
  }

  if (values.message.trim().length > 1000) {
    errors.message = "Message must be 1000 characters or less";
  }

  return errors;
}

const emptyForm = { eventDate: "", eventLocation: "", message: "" };

export default function BookingDialog({ service }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleOpenChange = (nextOpen) => {
    if (loading) return; // do not close while sending
    setOpen(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = validate(values);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch("/api/bookings", {
        method: "POST",
        body: {
          serviceId: service._id,
          eventDate: values.eventDate,
          eventLocation: values.eventLocation.trim(),
          message: values.message.trim(),
        },
      });

      toast.success(result.message || "Booking request sent", {
        action: {
          label: "View My Bookings",
          onClick: () => router.push("/dashboard/customer/bookings"),
        },
      });
      setOpen(false);
      setValues(emptyForm);
      setErrors({});
    } catch (error) {
      toast.error(error.message || "Could not send your booking request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="w-full" size="lg" onClick={() => setOpen(true)}>
        <CalendarCheck className="h-4 w-4" />
        Request Booking
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Request a Booking
            </DialogTitle>
            <DialogDescription>
              Tell the vendor about your event. They will accept or reject your
              request from their dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-secondary/60 p-3 text-sm">
            <p className="font-semibold">{service.serviceName}</p>
            <p className="text-muted-foreground">
              {service.vendor.businessName || service.vendor.name} ·{" "}
              {formatPrice(service.price)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                min={getToday()}
                max={getMaxDate()}
                value={values.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                disabled={loading}
              />
              {errors.eventDate && (
                <p className="text-sm text-destructive">{errors.eventDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event Location</Label>
              <Input
                id="eventLocation"
                placeholder="e.g. Hotel Sonargaon, Dhaka"
                value={values.eventLocation}
                onChange={(e) => updateField("eventLocation", e.target.value)}
                disabled={loading}
              />
              {errors.eventLocation && (
                <p className="text-sm text-destructive">
                  {errors.eventLocation}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (optional)</Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="Guest count, preferred time, special requests..."
                value={values.message}
                onChange={(e) => updateField("message", e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-end text-xs text-muted-foreground">
                {values.message.length}/1000
              </div>
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending request..." : "Send Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

