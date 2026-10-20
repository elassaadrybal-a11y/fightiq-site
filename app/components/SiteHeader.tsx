"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "../site";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

const notifyHref = `mailto:${site.contactEmail}?subject=Notify%20me%20about%20launch`;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label={`${site.name} home`} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fightiq-transparent.png" alt={site.name} className="h-7 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <a
            href={notifyHref}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-glow"
          >
            Get notified
          </a>
        </nav>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="block h-0.5 w-6 bg-foreground" />
          <span className="block h-0.5 w-6 bg-foreground" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background/95 px-6 py-4 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-base text-muted transition hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={notifyHref}
              onClick={() => setOpen(false)}
              className="rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Get notified
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
