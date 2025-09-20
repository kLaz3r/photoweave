import Image from "next/image";
import HeroBackground from "~/components/HeroBackground";
import {
  CreateShareIcon,
  ScreenToFrameIcon,
  SmartLayoutsIcon,
} from "~/components/icons";

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

export default function HomePage() {
  return (
    <main className="bg-background text-text relative flex min-h-screen flex-col items-center justify-center">
      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-12">
        <HeroSection />
        <FeaturesSection />
      </div>
    </main>
  );
}
