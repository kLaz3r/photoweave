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

const HeroSection = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <HeroBackground blur={100} width={960} height={540} opacity={0.2} />
      <div className="container mt-[100px] flex h-[calc(100vh-100px)] flex-row items-center justify-between">
        <div className="flex w-1/2 flex-col gap-6">
          <h1 className="font-display text-8xl font-bold">
            Turn your photo chaos into{" "}
            <span className="text-gradient">COLLAGE</span> magic.
          </h1>
          <p className="text-2xl">
            PhotoWeave intelligently arranges your best memories into a stunning
            collage, automatically. No fuss, just fun.
          </p>
          <div className="flex flex-row gap-4">
            <button className="bg-accent rounded-full px-8 py-4 text-2xl font-bold text-white">
              Start Weaving!
            </button>
            <p className="text-lg">
              Join 10,000+ happy creators <br /> who&apos;ve woven their
              stories!
            </p>
          </div>
        </div>
        <div>
          <Image
            src="/hero-photo.png"
            alt="Hero image"
            width={600}
            height={600}
          />
        </div>
      </div>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <div className="py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-3">
              <SmartLayoutsIcon height={40} />
              <h3 className="font-display text-2xl font-bold text-[var(--theme-accent)]">
                Instant, Smart Layouts
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Just select your photos and watch as our AI &apos;weaves&apos;
              them into the perfect layout in seconds. No more dragging,
              dropping, or resizing!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-3">
              <CreateShareIcon height={40} />
              <h3 className="font-display text-2xl font-bold text-[var(--theme-accent)]">
                Create &amp; Share Instantly
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Skip the app stores. PhotoWeave works instantly in your browser on
              any device, letting you create and share a beautiful collage in
              just a few clicks.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center gap-3">
              <ScreenToFrameIcon height={40} />
              <h3 className="font-display text-2xl font-bold text-[var(--theme-accent)]">
                From Screen to Frame
              </h3>
            </div>
            <p className="text-lg leading-relaxed">
              Download every collage in stunning high resolution, perfect for
              anything from a phone screen to a poster on your wall. No blur,
              just beauty.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FrameSection = () => {
  return (
    <div className="py-24">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-5xl leading-tight font-bold md:text-6xl">
            Bring your whole holiday adventure into a <br />{" "}
            <span className="text-gradient">single, beautiful</span> frame.
          </h2>
          <p className="text-xl md:text-2xl">
            Don&apos;t let your favorite moments get lost in your camera roll.
            Tell the whole story at a glance and relive the fun over and over
            again.
          </p>
          <ul className="list-disc space-y-3 pl-6 text-xl">
            <li>Showcase every highlight, from beach days to city nights</li>
            <li>Combine photos from multiple phones into one epic story</li>
            <li>
              Create the perfect &apos;thank you&apos; card for travel buddies
            </li>
            <li>Print it for a real-life photo frame that makes you smile</li>
          </ul>
        </div>

        <div className="flex w-full items-center justify-center">
          <CollageIllustration
            className="h-auto"
            width={700}
            title="Collage frame illustration"
          />
        </div>
      </div>
    </div>
  );
};

const PhoneSection = () => {
  return (
    <div className="py-24">
      <div className="container mx-auto grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="flex items-center justify-center self-center">
          <Image
            src="/phone.png"
            alt="Phone collage preview"
            width={520}
            height={520}
          />
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="font-display text-5xl leading-tight font-bold md:text-6xl">
            Your camera roll’s new
            <br />
            <span className="text-gradient">best friend.</span>
          </h2>
          <p className="text-xl md:text-2xl">
            PhotoWeave transforms that endless scroll of pictures into a
            collection of cherished memories you&apos;ll actually want to look
            at, share, and print.
          </p>
          <ul className="list-disc space-y-3 pl-6 text-xl">
            <li>Go from hundreds of pics to one masterpiece</li>
            <li>Rediscover forgotten gems from your gallery</li>
            <li>Perfect for birthdays, parties, and family events</li>
          </ul>
        </div>
      </div>
    </div>
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
    <div className="py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12 xl:gap-16">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl p-[2px]"
              style={{
                background:
                  "linear-gradient(180deg, var(--theme-accent), var(--theme-primary))",
              }}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FAQSection = () => {
  return (
    <div className="py-24">
      <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-5xl leading-tight font-bold md:text-6xl">
            Spend less time editing, more time remembering.
          </h2>
          <p className="text-xl md:text-2xl">
            PhotoWeave is the simplest, most cheerful way to gather your
            memories. Just pick your photos, and our smart tech handles the
            rest, creating something beautiful you&apos;ll be excited to share.
          </p>
        </div>

        <div>
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
                may be offered later, but the core experience will remain free.
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
                Your photos stay private. We only process them to generate your
                collage and don’t share them with anyone.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <main className="bg-background text-text relative flex min-h-screen flex-col items-center justify-center">
      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-6">
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
    <div className="py-28">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6 text-center">
        <p className="text-lg opacity-80 md:text-xl">
          You pick the pics. We do the magic.
        </p>
        <h2 className="font-display text-5xl leading-tight font-bold md:text-7xl">
          Ready to weave your
          <br />
          <span className="text-gradient">own story?</span>
        </h2>
        <button
          type="button"
          className="bg-accent rounded-full px-10 py-5 text-2xl font-bold text-white shadow-lg transition-colors hover:opacity-90"
        >
          Start Weaving!
        </button>
      </div>
    </div>
  );
};
