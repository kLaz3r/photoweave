"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "~/components/ThemeToggle";

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { label: "Home", href: "/", isActive: (p) => p === "/" },
  {
    label: "Collage",
    href: "/collage",
    isActive: (p) => p.startsWith("/collage"),
  },
  {
    label: "Features",
    href: "/features",
    isActive: (p) => p.startsWith("/features"),
  },
  { label: "About", href: "/about", isActive: (p) => p.startsWith("/about") },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="text-text bg-background/70 fixed top-0 right-0 left-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/photoweave-logo.svg"
            alt="Photoweave logo"
            width={75}
            height={75}
            priority
          />
        </Link>

        <div className="flex items-center gap-8">
          <ul className="font-display flex items-center gap-12 text-3xl">
            {navItems.map((item) => {
              const active = item.isActive(pathname ?? "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "transition-colors",
                      active
                        ? "text-primary decoration-primary underline decoration-4 underline-offset-8"
                        : "hover:text-primary decoration-primary decoration-4 underline-offset-8 hover:underline",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ThemeToggle className="font-display text-2xl" size={22} />
        </div>
      </div>
    </nav>
  );
}
