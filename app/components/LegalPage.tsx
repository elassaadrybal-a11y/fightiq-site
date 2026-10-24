import type { ReactNode } from "react";
import MobileHeader from "./mobile/MobileHeader";
import { legal } from "../legal";

export function LegalPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <>
      <MobileHeader />
      <main className="relative min-h-svh bg-black px-6 pb-16 pt-36 text-white md:pt-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[24rem]"
          style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(168,85,247,0.22), transparent 70%)" }}
        />
        <article className="relative mx-auto max-w-2xl">
          <h1 className="text-[clamp(2.4rem,10vw,3.5rem)] font-bold leading-[1.05] tracking-tight">{title}</h1>
          <p className="mt-4 text-sm text-white/45">{`Last updated ${legal.updated}`}</p>
          {intro ? <p className="mt-8 text-lg leading-relaxed text-white/75">{intro}</p> : null}
          <div className="mt-4">{children}</div>
        </article>
      </main>
    </>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-12 text-2xl font-semibold tracking-tight">{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-base leading-relaxed text-white/70">{children}</p>;
}

export function UL({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-base leading-relaxed text-white/70">
          <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#a855f7]" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
      {children}
    </a>
  );
}

// "Fight IQ is run by ..." line used at the top of each page
export function SellerLine() {
  return (
    <>
      {`Fight IQ is run by ${legal.seller}, ${legal.address}`}
      {legal.companyNumber ? ` (enterprise number ${legal.companyNumber})` : ""}.
    </>
  );
}
