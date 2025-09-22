"use client";

import { cubicBezier } from "motion";
import { motion } from "motion/react";
import Image from "next/image";
import { PiUserFill } from "react-icons/pi";
import HeroBackground from "~/components/HeroBackground";
import {
  CollageIllustration,
  CreateShareIcon,
  ScreenToFrameIcon,
  SmartLayoutsIcon,
} from "~/components/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const easeOutExpo = cubicBezier(0.22, 1, 0.36, 1);

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.85, ease: easeOutExpo },
  },
};

const HeroSection = () => {
  return (
    <motion.section
      className="relative flex min-h-screen w-full items-center justify-center"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <HeroBackground blur={100} width={960} height={540} opacity={0.2} />
      <div className="container mt-[100px] flex h-[calc(100vh-100px)] flex-col items-center justify-between md:flex-row">
        <motion.div
          className="flex w-full flex-col gap-6 md:w-1/2"
          variants={fadeUpChild}
        >
          <motion.h1
            className="font-display text-5xl md:text-8xl"
            variants={fadeUpChild}
          >
            Turn your photo chaos into{" "}
            <span className="text-gradient">COLLAGE</span> magic.
          </motion.h1>
          <motion.p className="text-lg md:text-2xl" variants={fadeUpChild}>
            PhotoWeave intelligently arranges your best memories into a stunning
            collage, automatically. No fuss, just fun.
          </motion.p>
          <motion.div
            className="flex flex-col items-center gap-4 md:flex-row"
            variants={fadeUpChild}
          >
            <motion.button
              className="bg-accent rounded-full px-8 py-4 text-2xl font-bold text-white"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            >
              Start Weaving!
            </motion.button>
            <motion.p className="text-lg" variants={fadeUpChild}>
              Join 10,000+ happy creators <br /> who&apos;ve woven their
              stories!
            </motion.p>
          </motion.div>
        </motion.div>
        <motion.div variants={fadeUpChild}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.95, ease: easeOutExpo }}
          >
            <Image
              className="w-full md:w-auto"
              src="/hero-photo.png"
              alt="Hero image"
              width={600}
              height={600}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const FeaturesSection = () => {
  return (
    <motion.section
      className="py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {/* Feature 1 */}
          <motion.div className="flex flex-col gap-3" variants={fadeUpChild}>
            <div className="flex flex-row items-center gap-3">
              <SmartLayoutsIcon height={40} />
              <h3 className="font-display text-2xl text-[var(--theme-accent)]">
                Instant, Smart Layouts
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Just select your photos and watch as our AI &apos;weaves&apos;
              them into the perfect layout in seconds. No more dragging,
              dropping, or resizing!
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div className="flex flex-col gap-3" variants={fadeUpChild}>
            <div className="flex flex-row items-center gap-3">
              <CreateShareIcon height={40} />
              <h3 className="font-display text-2xl text-[var(--theme-accent)]">
                Create &amp; Share Instantly
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Skip the app stores. PhotoWeave works instantly in your browser on
              any device, letting you create and share a beautiful collage in
              just a few clicks.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div className="flex flex-col gap-3" variants={fadeUpChild}>
            <div className="flex flex-row items-center gap-3">
              <ScreenToFrameIcon height={40} />
              <h3 className="font-display text-2xl text-[var(--theme-accent)]">
                From Screen to Frame
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Download every collage in stunning high resolution, perfect for
              anything from a phone screen to a poster on your wall. No blur,
              just beauty.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

const FrameSection = () => {
  return (
    <motion.section
      className="py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <motion.div className="flex flex-col gap-6" variants={slideLeft}>
          <motion.h2
            className="font-display text-5xl leading-12 md:text-6xl md:leading-tight"
            variants={fadeUpChild}
          >
            Bring your whole holiday adventure into a <br />{" "}
            <span className="text-gradient">single, beautiful</span> frame.
          </motion.h2>
          <motion.p className="text-xl md:text-2xl" variants={fadeUpChild}>
            Don&apos;t let your favorite moments get lost in your camera roll.
            Tell the whole story at a glance and relive the fun over and over
            again.
          </motion.p>
          <motion.ul
            className="list-disc space-y-3 pl-6 text-xl"
            variants={staggerContainer}
          >
            <motion.li variants={fadeUpChild}>
              Showcase every highlight, from beach days to city nights
            </motion.li>
            <motion.li variants={fadeUpChild}>
              Combine photos from multiple phones into one epic story
            </motion.li>
            <motion.li variants={fadeUpChild}>
              Create the perfect &apos;thank you&apos; card for travel buddies
            </motion.li>
            <motion.li variants={fadeUpChild}>
              Print it for a real-life photo frame that makes you smile
            </motion.li>
          </motion.ul>
        </motion.div>

        <motion.div
          className="flex w-full items-center justify-center"
          variants={slideRight}
        >
          <motion.div
            className="w-full max-w-[350px] md:max-w-[700px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          >
            <CollageIllustration
              className="h-auto w-full"
              title="Collage frame illustration"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

const PhoneSection = () => {
  return (
    <motion.section
      className="py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <motion.div
          className="flex items-center justify-center self-center"
          variants={slideLeft}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="/phone.png"
              alt="Phone collage preview"
              width={520}
              height={520}
            />
          </motion.div>
        </motion.div>

        <motion.div className="flex flex-col gap-6" variants={slideRight}>
          <motion.h2
            className="font-display text-6xl leading-16 md:text-6xl"
            variants={fadeUpChild}
          >
            Your camera roll’s new
            <br />
            <span className="text-gradient">best friend.</span>
          </motion.h2>
          <motion.p className="text-xl md:text-2xl" variants={fadeUpChild}>
            PhotoWeave transforms that endless scroll of pictures into a
            collection of cherished memories you&apos;ll actually want to look
            at, share, and print.
          </motion.p>
          <motion.ul
            className="list-disc space-y-3 pl-6 text-xl"
            variants={staggerContainer}
          >
            <motion.li variants={fadeUpChild}>
              Go from hundreds of pics to one masterpiece
            </motion.li>
            <motion.li variants={fadeUpChild}>
              Rediscover forgotten gems from your gallery
            </motion.li>
            <motion.li variants={fadeUpChild}>
              Perfect for birthdays, parties, and family events
            </motion.li>
          </motion.ul>
        </motion.div>
      </div>
    </motion.section>
  );
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "I finally found a way to share our family vacation photos without sending 50 separate pictures! It took me two minutes. A lifesaver!",
    name: "Maria P.",
    role: "Mom & Weekend Adventurer",
  },
  {
    quote:
      "I used to spend hours in complicated apps. PhotoWeave just gets it. The automatic layouts are surprisingly brilliant. My travel pics have never looked better.",
    name: "Alex J.",
    role: "World Traveler",
  },
  {
    quote:
      "Made a collage for my friend's birthday and it looked SO good. Everyone asked what app I used. Super easy and fun, 10/10 would recommend.",
    name: "Chloe T.",
    role: "Student",
  },
];

const TestimonialsSection = () => {
  return (
    <motion.section
      className="py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 xl:gap-16"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08, delayChildren: 0.05 },
            },
          }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              className="rounded-3xl p-[1px] drop-shadow-lg"
              style={{
                background:
                  "linear-gradient(180deg, var(--theme-accent), var(--theme-primary))",
              }}
              variants={fadeUpChild}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <div className="bg-background flex h-full flex-col justify-between rounded-3xl p-8 md:p-10">
                <p className="text-lg leading-relaxed md:text-xl">
                  “{t.quote}”
                </p>
                <div className="mt-10 flex items-center gap-4">
                  <div className="bg-primary flex h-14 w-14 items-center justify-center rounded-full">
                    <PiUserFill
                      className="text-[var(--theme-illustration-dark)]"
                      size={28}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-display text-2xl font-bold">
                      {t.name}
                    </span>
                    <span className="text-sm opacity-80 md:text-base">
                      {t.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

const FAQSection = () => {
  return (
    <motion.section
      className="py-24"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-2">
        <motion.div className="flex flex-col gap-4" variants={slideLeft}>
          <motion.h2
            className="font-display text-center text-6xl leading-tight md:text-left md:text-6xl"
            variants={fadeUpChild}
          >
            Spend less time editing, more time remembering.
          </motion.h2>
          <motion.p className="text-xl md:text-2xl" variants={fadeUpChild}>
            PhotoWeave is the simplest, most cheerful way to gather your
            memories. Just pick your photos, and our smart tech handles the
            rest, creating something beautiful you&apos;ll be excited to share.
          </motion.p>
        </motion.div>

        <motion.div variants={slideRight}>
          <motion.div variants={fadeUpChild}>
            <Accordion
              type="single"
              collapsible
              className="divide-y divide-[color:rgba(0,0,0,0.08)] dark:divide-[color:rgba(255,255,255,0.1)]"
            >
              <AccordionItem value="q1">
                <AccordionTrigger className="text-2xl">
                  Is PhotoWeave free to use?
                </AccordionTrigger>
                <AccordionContent>
                  Yes. You can create collages for free. Premium export options
                  may be offered later, but the core experience will remain
                  free.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger className="text-2xl">
                  How many photos can I add to one collage?
                </AccordionTrigger>
                <AccordionContent>
                  Add as many as you like—our smart layout adapts. For best
                  results, we recommend 10–50 photos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger className="text-2xl">
                  Does this work on my phone?
                </AccordionTrigger>
                <AccordionContent>
                  Absolutely. PhotoWeave is a web app that works on modern
                  browsers across iOS, Android, and desktop.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger className="text-2xl">
                  Can I make adjustments to the final collage?
                </AccordionTrigger>
                <AccordionContent>
                  Yes—you can shuffle layouts, swap photos, and fine‑tune the
                  arrangement before exporting.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q5">
                <AccordionTrigger className="text-2xl">
                  What happens to my photos? Are they private?
                </AccordionTrigger>
                <AccordionContent>
                  Your photos stay private. We only process them to generate
                  your collage and don’t share them with anyone.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default function HomePage() {
  return (
    <main className="bg-background text-text relative flex min-h-screen w-screen max-w-screen flex-col items-center justify-center">
      <div className="relative z-10 flex w-screen max-w-screen flex-col items-center justify-center px-4">
        <HeroSection />
        <FeaturesSection />
        <FrameSection />
        <PhoneSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </div>
    </main>
  );
}

const FinalCTASection = () => {
  return (
    <motion.section
      className="py-28"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className="container mx-auto flex flex-col items-center justify-center gap-6 text-center"
        variants={staggerContainer}
      >
        <motion.p
          className="text-2xl opacity-80 md:text-xl"
          variants={fadeUpChild}
        >
          You pick the pics. <br /> We do the magic.
        </motion.p>
        <motion.h2
          className="font-display text-6xl leading-16 md:text-7xl"
          variants={fadeUpChild}
        >
          Ready to weave your
          <br />
          <span className="text-gradient">own story?</span>
        </motion.h2>
        <motion.button
          type="button"
          className="bg-accent rounded-full px-10 py-5 text-2xl font-bold text-white shadow-lg transition-colors hover:opacity-90"
          variants={fadeUpChild}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
        >
          Start Weaving!
        </motion.button>
      </motion.div>
    </motion.section>
  );
};
