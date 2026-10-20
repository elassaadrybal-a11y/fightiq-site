"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { site } from "../site";

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
        <span
          aria-disabled="true"
          className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white/50"
        >
          Checkout opens at launch
        </span>
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

/* ---------- Sample reports (placeholder content) ---------- */

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={ACCENT}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          style={{ filter: `drop-shadow(0 0 6px ${ACCENT})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold">{value}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</span>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.15em] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c084fc]">{title}</h4>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function List({ items, marker }: { items: string[]; marker: string }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it} className="flex gap-3 text-white/85">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/70">
            {marker}
          </span>
          <span className="leading-snug">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function ReportShell({ title, meta, children }: { title: string; meta: string; children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0912] p-6"
      style={{ boxShadow: `0 0 80px ${ACCENT}22` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-white/50">{meta}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#c084fc]/40 bg-[#a855f7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#c084fc]">
          Sample
        </span>
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}

function SparringReport() {
  const rounds = [
    { name: "Round 1", value: 64 },
    { name: "Round 2", value: 75 },
    { name: "Round 3", value: 70 },
  ];
  return (
    <ReportShell title="Sparring Analysis" meta="3 rounds · placeholder data">
      <div className="flex items-center gap-5">
        <ScoreRing value={72} label="Overall" />
        <div className="grid flex-1 grid-cols-1 gap-2">
          <Stat label="Punches thrown" value="214" />
          <Stat label="Landed" value="38%" />
        </div>
      </div>
      <Block title="Round by round">
        <div className="space-y-3">
          {rounds.map((r) => (
            <div key={r.name}>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">{r.name}</span>
                <span className="font-semibold">{r.value}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${r.value}%`, background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }} />
              </div>
            </div>
          ))}
        </div>
      </Block>
      <Block title="Strengths">
        <List marker="+" items={["Sharp, well-timed jab", "Good head movement on the counter", "Stays composed under pressure"]} />
      </Block>
      <Block title="Things to fix">
        <List marker="!" items={["Right hand drops after the jab", "Backs straight up when pressured", "Output fades late in rounds"]} />
      </Block>
      <Block title="Drills for you">
        <List marker="›" items={["Jab and return to guard, 3 x 3 min", "Pivot out off the ropes", "Late-round output intervals"]} />
      </Block>
    </ReportShell>
  );
}

function OpponentReport() {
  return (
    <ReportShell title="Opponent Scan" meta="2 clips · placeholder data">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Stance" value="Orthodox" />
        <Stat label="Style" value="Pressure" />
      </div>
      <Block title="Tendencies">
        <div className="flex flex-wrap gap-2">
          {["Leads with the jab", "Two-punch combos", "Circles to his left", "Slows down in round 3"].map((t) => (
            <span key={t} className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-sm text-white/80">
              {t}
            </span>
          ))}
        </div>
      </Block>
      <Block title="Openings">
        <List marker="+" items={["Left hand drops after the jab", "Chin stays high when coming forward", "Rarely defends the body"]} />
      </Block>
      <Block title="Game plan">
        <List
          marker="›"
          items={["Round 1: stay long and make them lead", "Round 2: counter the jab with your right hand", "Round 3: go to the body as their pace drops"]}
        />
      </Block>
      <Block title="Counters to drill">
        <List marker="!" items={["Slip outside the jab, right hand over the top", "Catch and return the jab", "Pivot off the ropes under pressure"]} />
      </Block>
    </ReportShell>
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
            This is the layout you get back. The content below is placeholder for now.
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
          <div className="mt-6">{tab === "sparring" ? <SparringReport /> : <OpponentReport />}</div>
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
