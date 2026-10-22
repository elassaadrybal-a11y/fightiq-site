"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "../site";
import { OpponentReport, SparringReport } from "./Reports";
import BuyButton from "./BuyButton";

const ACCENT = "#a855f7";
const notifyHref = `mailto:${site.contactEmail}?subject=Notify%20me%20when%20checkout%20opens`;

type ProductId = "sparring" | "opponent";

type Product = {
  id: ProductId;
  label: string;
  title: string;
  text: string;
  points: string[];
  glow: string;
};

const PRODUCTS: Product[] = [
  {
    id: "sparring",
    label: "Sparring Analysis",
    title: "Break down your own rounds",
    text: "Upload your sparring footage and get a coach-style breakdown of your strengths, habits and recurring mistakes.",
    points: ["Strengths and weaknesses", "Round-by-round breakdown", "Drills built from your footage"],
    glow: "#a855f7",
  },
  {
    id: "opponent",
    label: "Opponent Scanner",
    title: "Scout your next opponent",
    text: "Upload footage of your next opponent and get a scouting report you can train against.",
    points: ["Tendencies and habits", "Openings to exploit", "A game plan and counters"],
    glow: "#6366f1",
  },
];

/* ---------- Shared bits ---------- */

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/60">
      {children}
    </span>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#c084fc" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductIcon({ id }: { id: ProductId }) {
  if (id === "sparring") {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="white" strokeWidth="1.8" />
        <path d="M10 9.5v5l4.5-2.5z" fill="white" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2.5" fill="white" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Product cards ---------- */

function ProductCard({ p, onSample }: { p: Product; onSample: (id: ProductId) => void }) {
  return (
    <div
      className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0810] p-7"
      style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${p.glow}33 0%, transparent 60%)` }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]"
        style={{ boxShadow: `0 0 40px ${p.glow}55` }}
      >
        <ProductIcon id={p.id} />
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#c084fc]">{p.label}</p>
      <h3 className="mt-2 text-[clamp(1.8rem,8vw,2.2rem)] font-semibold leading-tight tracking-tight">{p.title}</h3>
      <p className="mt-3 text-base leading-relaxed text-white/65">{p.text}</p>
      <ul className="mt-6 space-y-3">
        {p.points.map((pt) => (
          <li key={pt} className="flex items-center gap-3 text-white/85">
            <Check />
            {pt}
          </li>
        ))}
      </ul>
      <div className="mt-8 border-t border-white/10 pt-6">
        <p className="text-sm text-white/50">Price announced at launch</p>
        <BuyButton product={p.id} />
        <button
          type="button"
          onClick={() => onSample(p.id)}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-base font-semibold text-white transition active:bg-white/10"
        >
          See a sample report
        </button>
      </div>
    </div>
  );
}

/* ---------- Report preview with "show more" ---------- */

function ReportPreview({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="relative">
      <div className={expanded ? "" : "max-h-[1100px] overflow-hidden"}>{children}</div>
      {!expanded && (
        <div className="absolute inset-x-0 bottom-0 flex h-48 items-end justify-center bg-linear-to-b from-transparent to-black pb-2">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex h-12 items-center rounded-full bg-white px-7 text-base font-semibold text-black"
          >
            Show the full report
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Page ---------- */

export default function ProductsView() {
  const [tab, setTab] = useState<ProductId>("sparring");

  const showSample = (id: ProductId) => {
    setTab(id);
    document.getElementById("sample")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-12 pt-36 text-center md:pt-40">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 70% at 50% 0%, ${ACCENT}55 0%, #3b076488 38%, transparent 72%), #000`,
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-black" />
        <div className="relative mx-auto max-w-xl">
          <Chip>Products</Chip>
          <h1 className="mt-6 text-[clamp(2.8rem,13vw,4.5rem)] font-bold leading-[0.98] tracking-tight">
            Try it on your
            <br />
            own footage.
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-lg leading-relaxed text-white/75">
            Pick a report, upload your clip and see exactly what Fight IQ finds.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-5xl px-5 pb-6">
        <div className="grid gap-5 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Reveal key={p.id} className="h-full">
              <ProductCard p={p} onSample={showSample} />
            </Reveal>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed text-white/45">
          Reports are generated by AI from your footage. They support your training and do not replace a qualified coach.
        </p>
      </section>

      {/* See what you get */}
      <section id="sample" className="scroll-mt-24 px-5 py-16">
        <Reveal className="text-center">
          <Chip>See what you get</Chip>
          <h2 className="mt-5 text-[clamp(2.2rem,10vw,3rem)] font-semibold leading-tight tracking-tight">The full report</h2>
          <p className="mx-auto mt-4 max-w-sm text-lg text-white/65">
            An example of each report, shown exactly as it appears in the app.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 max-w-xl">
          <div className="mx-auto flex w-full max-w-sm rounded-full border border-white/10 bg-white/[0.04] p-1" role="tablist">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={tab === p.id}
                onClick={() => setTab(p.id)}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                  tab === p.id ? "bg-white text-black" : "text-white/60"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-6">
            <ReportPreview key={tab}>{tab === "sparring" ? <SparringReport /> : <OpponentReport />}</ReportPreview>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-20 pt-6 text-center">
        <Reveal>
          <h2 className="text-[clamp(2.4rem,11vw,3.25rem)] font-semibold leading-[1.05] tracking-tight">
            Be first in line.
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-lg text-white/65">
            {"Checkout opens at launch. Leave your email and we'll tell you the day it does."}
          </p>
          <a
            href={notifyHref}
            className="mt-9 inline-flex h-14 items-center rounded-full bg-white px-9 text-lg font-semibold text-black shadow-[0_0_40px_rgba(168,85,247,0.35)]"
          >
            Get notified
          </a>
        </Reveal>
      </section>
    </div>
  );
}
