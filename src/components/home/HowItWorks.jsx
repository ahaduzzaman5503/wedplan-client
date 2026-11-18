import Reveal from "@/components/shared/Reveal";

const steps = [
  {
    title: "Browse and Compare",
    text: "Search wedding services by name, category or location and compare prices.",
  },
  {
    title: "Send a Booking Request",
    text: "Pick your event date and location, add a message and submit your request.",
  },
  {
    title: "Get a Response",
    text: "The vendor accepts or rejects your request, and you can track it from your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              How WedPlan Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps from idea to booking.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1}>
              <div className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary font-heading text-2xl font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-heading text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}