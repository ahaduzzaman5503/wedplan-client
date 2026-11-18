import Link from "next/link";
import { Heart, Mail, MapPin, Phone } from "lucide-react";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

const categories = [
  { href: "/services?category=Photography%20%26%20Videography", label: "Photography & Videography" },
  { href: "/services?category=Wedding%20Venues", label: "Wedding Venues" },
  { href: "/services?category=Decoration%20%26%20Florist", label: "Decoration & Florist" },
  { href: "/services?category=Catering%20Services", label: "Catering Services" },
];

// Simple inline social icons (no extra library needed)
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H7.7V13h2.7v8h3.1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" />
    </svg>
  );
}

const socialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: <FacebookIcon /> },
  { href: "https://instagram.com", label: "Instagram", icon: <InstagramIcon /> },
  { href: "https://x.com", label: "X (Twitter)", icon: <XIcon /> },
];

export default function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Logo + description */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-primary text-primary" />
            <span className="font-heading text-2xl font-bold text-primary">
              WedPlan
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            WedPlan connects couples with trusted wedding vendors. Discover
            venues, photographers, decorators, caterers and more, all in one
            place.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-heading text-lg font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-heading text-lg font-semibold">Categories</h3>
          <ul className="mt-4 space-y-2">
            {categories.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + social */}
        <div>
          <h3 className="font-heading text-lg font-semibold">Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Dhaka, Bangladesh
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              +880 1234-567890
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              support@wedplan.com
            </li>
          </ul>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="rounded-full border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} WedPlan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}