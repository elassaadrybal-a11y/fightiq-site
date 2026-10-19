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

export default function GloveFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
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
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = (vh - rect.top) / (rect.height + vh);
      progress.current = Math.min(1, Math.max(0, p));
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
    <section ref={sectionRef} className="relative h-[200svh] overflow-hidden">
      <ul className="sr-only">
        {PHRASES.map((lines) => (
          <li key={lines.join(" ")}>{lines.join(" ")}</li>
        ))}
      </ul>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, #a855f740, transparent)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {isMobile && <GloveCanvas progress={progress} active={active} phrases={PHRASES} />}
      </div>
    </section>
  );
}
