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

// How fast the glove moves up the screen compared with your scroll.
// Lower = it stays on screen longer. Must stay above about 1.6 at h-[500svh].
const GLOVE_SPEED = 1.75;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function GloveFeatures() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const offset = useRef(0);
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
      const vh = window.innerHeight;
      const ch = sticky.offsetHeight;
      const p = clamp01((vh - rect.top) / (rect.height + vh));
      progress.current = p;

      // Where the canvas sits on screen right now
      const canvasTop = rect.top > 0 ? rect.top : Math.min(0, rect.bottom - ch);
      // Where the glove should be on screen: crosses the middle halfway through
      const gloveCenter = vh * (0.5 - GLOVE_SPEED * (p - 0.5));
      // Offset from the canvas centre, as a fraction of its height (up = positive)
      const off = (ch / 2 - (gloveCenter - canvasTop)) / ch;
      offset.current = off;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(-50%, -50%) translateY(${-off * ch}px)`;
      }
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
      <div ref={stickyRef} aria-hidden="true" className="pointer-events-none sticky top-0 h-[100svh]">
        <div
          ref={glowRef}
          className="absolute left-1/2 top-1/2 h-[80vw] w-[80vw] rounded-full blur-3xl"
          style={{ transform: "translate(-50%, -50%)", background: "radial-gradient(closest-side, #a855f740, transparent)" }}
        />
        <div className="absolute inset-0">
          {isMobile && <GloveCanvas progress={progress} offset={offset} active={active} phrases={PHRASES} />}
        </div>
      </div>
    </section>
  );
}
