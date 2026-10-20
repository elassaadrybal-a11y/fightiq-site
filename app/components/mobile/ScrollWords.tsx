"use client";

import { useEffect, useRef, useState } from "react";

export default function ScrollWords({ text }: { text: string }) {
  const words = text.split(" ");
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    const inner = textRef.current;
    if (!el || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const pinTop = parseFloat(getComputedStyle(inner).top) || 0;
      const range = rect.height - inner.offsetHeight;
      const p = range > 0 ? (pinTop - rect.top) / range : 0;
      setProgress(Math.min(1, Math.max(0, p)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Fully lit at 80% of the section, so it holds briefly before scrolling on
  const lit = Math.min(1, progress / 0.8) * words.length;

  return (
    <section ref={sectionRef} className="relative h-[200svh]">
      <div ref={textRef} className="sticky top-[28svh] flex justify-center px-6 py-6">
        <p className="max-w-md text-center text-[clamp(2rem,9vw,2.6rem)] md:max-w-3xl md:text-5xl font-semibold leading-[1.15] tracking-tight text-white">
          {words.map((w, i) => {
            const amount = Math.min(1, Math.max(0, lit - i));
            return (
              <span key={i} style={{ opacity: 0.18 + 0.82 * amount }} className="transition-opacity duration-150">
                {w}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}
