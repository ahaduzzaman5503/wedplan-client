import { BadgeCheck, CalendarCheck, ShieldCheck, Wallet } from "lucide-react";
import Reveal from "@/components/shared/Reveal";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Admin-Reviewed Services",
    text: "Every service is reviewed by our team before it appears on the platform.",
  },
  {
    icon: CalendarCheck,
    title: "Simple Booking Requests",
    text: "Send a request with your date and location, then track its status any time.",
  },
  {
    icon: Wallet,
    title: "Clear Pricing",
    text: "See each service price upfront, and compare options side by side.",
  },
  {
    icon: ShieldCheck,
    title: "Safe and Secure",
    text: "Protected accounts, role-based access and secure Stripe payments for vendors.",
  },
];

export default function WhyChoose() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <div className="text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Why Choose WedPlan?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to plan with confidence.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Reveal key={benefit.title} delay={index * 0.08} className="h-full">
              <div className="h-full rounded-xl border bg-card p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/40 text-accent-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.text}
                </p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

