"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GloveCanvas = dynamic(() => import("./GloveCanvas"), { ssr: false });

type Item = { label: string; title: string; body: string; side: "left" | "right"; top: string };

const ITEMS: Item[] = [
  {
    label: "Sparring Analysis",
    title: "Every round, broken down.",
    body: "Upload a spar and get a coach-style breakdown of your strengths, habits and recurring mistakes.",
    side: "left",
    top: "6%",
  },
  {
    label: "Opponent Scanner",
    title: "Know them before the bell.",
    body: "Upload footage of your next opponent and get a scouting report you can train against.",
    side: "right",
    top: "30%",
  },
  {
    label: "Game Plan",
    title: "Openings, counters, a plan.",
    body: "See the tendencies to exploit and the counters to drill before fight night.",
    side: "left",
    top: "56%",
  },
  {
    label: "Training Score",
    title: "Every session, scored.",
    body: "Log your training and get a score for each session, so you can see the work adding up.",
    side: "right",
    top: "80%",
  },
];

const CHAR_STEP = 22;

function AnimatedLine({ text, shown, delay }: { text: string; shown: boolean; delay: number }) {
  const words = text.split(" ");
  const starts = words.map((_, i) => words.slice(0, i).join("").length);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, wi) => (
          <span key={wi}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((ch, ci) => {
                const i = starts[wi] + ci;
                return (
                  <span
                    key={ci}
                    style={{ transitionDelay: shown ? `${delay + i * CHAR_STEP}ms` : "0ms" }}
                    className={`inline-block transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      shown
                        ? "translate-y-0 rotate-0 opacity-100 blur-[0px]"
                        : `translate-y-[0.6em] opacity-0 blur-sm ${i % 2 ? "rotate-[8deg]" : "-rotate-[8deg]"}`
                    }`}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
            {wi < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </>
  );
}

function FeatureText({ item }: { item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setShown(entries.some((e) => e.isIntersecting)), {
      threshold: 0.5,
      rootMargin: "-8% 0px -8% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const right = item.side === "right";
  const titleChars = item.title.replace(/ /g, "").length;

  return (
    <div
      ref={ref}
      className={`absolute z-10 w-[80%] ${right ? "right-5 text-right" : "left-5 text-left"}`}
      style={{ top: item.top }}
    >
      <div className={`flex items-center gap-3 ${right ? "flex-row-reverse" : ""}`}>
        <span
          className={`h-px w-10 bg-[#c084fc] transition-transform duration-700 ease-out ${right ? "origin-right" : "origin-left"} ${
            shown ? "scale-x-100" : "scale-x-0"
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-[0.25em] text-[#c084fc] transition-all duration-700 ease-out ${
            shown ? "translate-x-0 opacity-100" : `opacity-0 ${right ? "translate-x-3" : "-translate-x-3"}`
          }`}
        >
          {item.label}
        </span>
      </div>
      <h3 className="mt-3 text-[clamp(1.9rem,8.5vw,2.4rem)] font-semibold leading-[1.08] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.85)]">
        <AnimatedLine text={item.title} shown={shown} delay={150} />
      </h3>
      <p
        style={{ transitionDelay: shown ? `${300 + titleChars * CHAR_STEP}ms` : "0ms" }}
        className={`mt-3 text-base leading-relaxed text-white/70 transition-all duration-700 ease-out [text-shadow:0_2px_16px_rgba(0,0,0,0.9)] motion-reduce:transition-none ${
          right ? "ml-auto" : ""
        } max-w-[17rem] ${shown ? "translate-y-0 opacity-100 blur-[0px]" : "translate-y-3 opacity-0 blur-sm"}`}
      >
        {item.body}
      </p>
    </div>
  );
}

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
    <section ref={sectionRef} className="relative h-[160svh] overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, #a855f740, transparent)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {isMobile && <GloveCanvas progress={progress} active={active} />}
      </div>
      {ITEMS.map((item) => (
        <FeatureText key={item.label} item={item} />
      ))}
    </section>
  );
}
