"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((v) => !v), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  return (
    <nav className="text-text bg-background/70 fixed top-0 right-0 left-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="inline-flex items-center">
          <Image
            src="/photoweave-logo.svg"
            alt="Photoweave logo"
            width={60}
            height={60}
            priority
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <ul className="font-display flex items-center gap-10 text-2xl">
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
          <ThemeToggle className="font-display text-xl" size={20} />
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md md:hidden"
        >
          <span className="sr-only">Menu</span>
          <motion.span
            initial={false}
            className="text-text relative block h-6 w-8"
          >
            <motion.span
              className="absolute top-0 left-0 h-1 w-full rounded bg-current"
              style={{ originX: 0.5, originY: 0.5 }}
              animate={isOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 32 }}
            />
            <motion.span
              className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 rounded bg-current"
              animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.18 }}
            />
            <motion.span
              className="absolute bottom-0 left-0 h-1 w-full rounded bg-current"
              style={{ originX: 0.5, originY: 0.5 }}
              animate={isOpen ? { rotate: -45, y: -10 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 32 }}
            />
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            key="mobile-dropdown"
            initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.6 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0.6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background/95 text-text absolute top-full right-0 left-0 z-[60] border-t border-white/10 shadow-xl md:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06, delayChildren: 0.05 },
                },
              }}
              className="font-display flex flex-col items-end gap-8 py-8 pr-6 pl-6 text-right text-5xl sm:pr-8 sm:pl-8"
            >
              {navItems.map((item) => {
                const active = item.isActive(pathname ?? "/");
                return (
                  <motion.li
                    key={item.href}
                    variants={{
                      hidden: { y: -8, opacity: 0 },
                      show: { y: 0, opacity: 1 },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeMenu}
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
                  </motion.li>
                );
              })}
              <motion.li
                key="theme-toggle-mobile"
                variants={{
                  hidden: { y: -8, opacity: 0 },
                  show: { y: 0, opacity: 1 },
                }}
              >
                <ThemeToggle className="font-display" size={28} />
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
