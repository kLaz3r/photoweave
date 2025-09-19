import Image from "next/image";

const HeroSection = () => {
  return (
    <div className="mt-[100px] flex h-[calc(100vh-100px)] flex-row items-center justify-between">
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
            Join 10,000+ happy creators <br /> who&apos;ve woven their stories!
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
  );
};

export default function HomePage() {
  return (
    <main className="bg-background text-text flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4">
        <HeroSection />
      </div>
    </main>
  );
}
