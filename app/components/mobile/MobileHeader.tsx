"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "../../site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
];

const notifyHref = `mailto:${site.contactEmail}?subject=Notify%20me%20about%20launch`;

export default function MobileHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-[calc(env(safe-area-inset-top)+12px)] md:hidden">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between pl-5 pr-2">
          <Link href="/" onClick={close} aria-label={`${site.name} home`} className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fightiq-transparent.png" alt={site.name} className="h-7 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <span className="relative block h-3.5 w-6">
              <span className={`absolute left-0 h-0.5 w-6 rounded bg-white transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-6 rounded bg-white transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
              <span className={`absolute left-0 h-0.5 w-6 rounded bg-white transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>

        {open && (
          <nav id="mobile-menu" className="border-t border-white/10 px-3 pb-3 pt-2" aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className="block rounded-2xl px-3 py-3 text-lg text-white/85 active:bg-white/10">
                {l.label}
              </Link>
            ))}
            <a href={notifyHref} onClick={close} className="mt-2 flex h-12 items-center justify-center rounded-full bg-white text-base font-semibold text-black">
              Get notified
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
