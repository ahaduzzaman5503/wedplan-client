import Link from "next/link";
import {
  Camera,
  Flower2,
  Landmark,
  Shirt,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Reveal from "@/components/shared/Reveal";

const categories = [
  {
    name: "Photography & Videography",
    icon: Camera,
    description: "Capture every moment beautifully",
  },
  {
    name: "Wedding Venues",
    icon: Landmark,
    description: "Halls, gardens and resorts",
  },
  {
    name: "Decoration & Florist",
    icon: Flower2,
    description: "Stage, flowers and themes",
  },
  {
    name: "Catering Services",
    icon: UtensilsCrossed,
    description: "Menus for every guest list",
  },
  {
    name: "Makeup & Styling",
    icon: Sparkles,
    description: "Bridal looks and styling",
  },
  {
    name: "Wedding Fashion",
    icon: Shirt,
    description: "Outfits for the big day",
  },
];

export default function Categories() {
  return (
    <section className="bg-secondary/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Wedding Service Categories
            </h2>
            <p className="mt-2 text-muted-foreground">
              Explore services by category and find exactly what you need.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Reveal key={category.name} delay={index * 0.06} className="h-full">
                <Link
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                  className="group flex h-full flex-col items-center rounded-xl border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold leading-snug">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
