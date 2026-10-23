import Link from "next/link";
import { site } from "../site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/the-app", label: "The App" },
];

export default function Footer() {
  return (
    <footer className="bg-black px-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link href="/" aria-label={`${site.name} home`} className="inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fightiq-transparent.png" alt={site.name} className="h-7 w-auto" />
            </Link>
            <p className="mt-4 text-base leading-relaxed text-white/55">
              AI breakdowns of your sparring and your next opponent. Train smart. Fight smarter.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <nav aria-label="Footer">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Explore</p>
              <ul className="mt-4 space-y-3">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-base text-white/75 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href="/contact" className="text-base text-white/75 transition hover:text-white">
                    Contact us
                  </a>
                </li>
              </ul>
            </nav>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Get in touch</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="/contact" className="text-base text-white/75 transition hover:text-white">
                    Send a message
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.contactEmail}`} className="break-all text-base text-white/75 transition hover:text-white">
                    {site.contactEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 text-sm text-white/40 md:flex-row md:items-center md:justify-between">
          <p>{`\u00a9 2026 ${site.name}. All rights reserved.`}</p>
          <p>Coming soon to iPhone</p>
        </div>
      </div>
    </footer>
  );
}
