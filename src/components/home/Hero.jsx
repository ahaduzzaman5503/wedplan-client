"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { Button } from "@/components/ui/button";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <MotionConfig reducedMotion="user">
      <section
        className="relative isolate overflow-hidden"
        style={{ backgroundColor: "#7f1d3a" }}
      >
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(76,16,36,0.88) 0%, rgba(76,16,36,0.6) 55%, rgba(76,16,36,0.35) 100%), url('/hero.jpg')",
          }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8"
        >
          <motion.p
            variants={item}
            className="text-sm font-medium uppercase tracking-[0.25em] text-accent"
          >
            Wedding Planning Platform
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 max-w-2xl font-heading text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            Your Dream Wedding Starts Here
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base text-white/85 sm:text-lg"
          >
            Discover trusted photographers, venues, decorators, caterers and
            more. Compare services, request bookings and plan every detail in
            one place.
          </motion.p>
          <motion.div variants={item} className="mt-8">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              nativeButton={false}
              render={<Link href="/services" />}
            >
              Explore Wedding Services
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

