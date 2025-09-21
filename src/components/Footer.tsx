import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-background text-text">
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--theme-primary), var(--theme-accent))",
        }}
      />
      <div className="container mx-auto flex flex-col items-center gap-6 py-8 md:flex-row md:justify-between">
        <div className="flex flex-col">
          <span className="font-display text-4xl font-bold">PhotoWeave</span>
          <span className="text-lg opacity-90">Create. Combine. Cherish.</span>
        </div>

        <div className="text-center text-lg">
          <span>
            Made with <span className="text-[var(--theme-accent)]">❤️</span> by
          </span>{" "}
          <Link
            href="https://github.com/stefannasturas"
            className="font-semibold text-[var(--theme-accent)] hover:underline"
          >
            Stefan Nasturas
          </Link>
        </div>

        <div className="text-center text-lg md:text-right">
          <div>© Copyright {year} Stefan Nasturas.</div>
          <div>All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
