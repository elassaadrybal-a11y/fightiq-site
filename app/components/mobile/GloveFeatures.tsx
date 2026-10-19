"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GloveCanvas = dynamic(() => import("./GloveCanvas"), { ssr: false });

// Each phrase is one or two lines. Keep lines under about 25 characters.
const PHRASES: string[][] = [
  ["Every round of your spar,", "broken down"],
  ["Scout your next opponent", "before the bell"],
  ["Openings to exploit,", "counters to drill"],
  ["Log every session,", "get a score"],
];

// Must match OUTRO_START in GloveCanvas.tsx
const OUTRO_START = 0.86;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function GloveFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef(0);
  const [active, setActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    const sticky = stickyRef.current;
    if (!el || !sticky) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const range = rect.height - sticky.offsetHeight;
      // 0 when the glove settles in the middle, 1 just before it scrolls away
      const p = range > 0 ? clamp01(-rect.top / range) : 0;
      progress.current = p;

      // Faint brand rows fade in and drift during the outro
      const o = clamp01((p - OUTRO_START) / (1 - OUTRO_START));
      if (markRef.current) markRef.current.style.opacity = String(o);
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const dir = i % 2 === 0 ? 1 : -1;
        row.style.transform = `translateX(${dir * (o * 14 - 24)}vw)`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const io = new IntersectionObserver((entries) => setActive(entries.some((e) => e.isIntersecting)), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      io.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[500svh] overflow-clip">
      <ul className="sr-only">
        {PHRASES.map((lines) => (
          <li key={lines.join(" ")}>{lines.join(" ")}</li>
        ))}
      </ul>
      <div ref={stickyRef} aria-hidden="true" className="pointer-events-none sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-[95vw] w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, #a855f726, transparent)" }}
        />
        <div ref={markRef} className="absolute inset-0 flex flex-col justify-center gap-1 opacity-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(node) => {
                rowRefs.current[i] = node;
              }}
              className="whitespace-nowrap text-[26vw] font-semibold leading-[0.95] tracking-tight text-white/[0.05]"
            >
              FIGHT IQ FIGHT IQ FIGHT IQ
            </div>
          ))}
        </div>
        <div className="absolute inset-0">
          {isMobile && <GloveCanvas progress={progress} active={active} phrases={PHRASES} />}
        </div>
      </div>
    </section>
  );
}
