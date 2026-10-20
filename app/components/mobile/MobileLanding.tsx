"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import MobileHeader from "./MobileHeader";
import ScrollWords from "./ScrollWords";
import GloveFeatures from "./GloveFeatures";
import BeltCarousel from "./BeltCarousel";
import { site } from "../../site";

const ACCENT = "#a855f7";

const STORY =
  "Hours of sparring footage sit on your phone, unwatched. Meanwhile the same mistakes follow you from one round to the next. It's time to fight smarter.";


const STATS = [
  { big: "2", title: "Ways to analyse", body: "Your own sparring and your opponent's footage, in one app." },
  { big: "1", title: "Score per session", body: "Log a training session and get a score, so progress is something you can see." },
];

const INSIDE = ["Sparring analysis", "Opponent scan", "Training log with session scores", "Progress history on your profile"];

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
      { threshold: 0.2 }
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

function NotifyButton() {
  return (
    <a
      href={`mailto:${site.contactEmail}?subject=Notify%20me%20about%20launch`}
      className="inline-flex h-14 items-center rounded-full bg-white px-9 text-lg font-semibold text-black shadow-[0_0_40px_rgba(168,85,247,0.35)]"
    >
      Get notified
    </a>
  );
}

export default function MobileLanding() {
  return (
    <div className="bg-black text-white">
      <MobileHeader />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-8 pt-32 text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 65% at 50% 0%, ${ACCENT}66 0%, #3b076499 38%, transparent 72%), radial-gradient(70% 45% at 90% 75%, ${ACCENT}26 0%, transparent 70%), radial-gradient(60% 40% at 5% 55%, #6d28d933 0%, transparent 70%), #000`,
          }}
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-black" />

        <div className="relative">
          <h1 className="text-[clamp(3.2rem,16vw,4.75rem)] md:text-[7rem] font-bold leading-[0.95] tracking-tight">
            Fight with
            <br />
            a plan.
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-lg leading-relaxed text-white/75 md:max-w-xl md:text-xl">
            {"Fight IQ breaks down your sparring and your opponent's footage, so you walk in knowing what works and what to fix."}
          </p>
          <div className="mt-9">
            <NotifyButton />
          </div>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/50">Coming soon to iPhone</p>
          <a href="#m-trailer" className="mt-14 inline-flex items-center gap-3 text-lg text-white/80">
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
              <path d="M0 0l14 8-14 8z" fill="currentColor" />
            </svg>
            Watch the trailer
          </a>
        </div>
      </section>

      {/* Trailer placeholder */}
      <section id="m-trailer" className="scroll-mt-28 px-4 pb-4">
        <div className="relative mx-auto flex aspect-video w-full max-w-xl md:max-w-4xl items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-neutral-900">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/80">
            <svg width="20" height="22" viewBox="0 0 14 16" aria-hidden="true" className="ml-1">
              <path d="M0 0l14 8-14 8z" fill="white" />
            </svg>
          </div>
          <span className="absolute bottom-4 text-sm text-white/50">Trailer coming soon</span>
        </div>
      </section>

      {/* Scroll-highlighted statement */}
      <ScrollWords text={STORY} />

      {/* 3D glove with feature texts */}
      <GloveFeatures />

      {/* Belts (not in the app yet) */}
      <section className="py-12">
        <Reveal className="px-6 text-center">
          <Chip>Coming soon</Chip>
          <h2 className="mt-5 text-[clamp(2.2rem,10vw,3rem)] md:text-6xl font-semibold leading-tight tracking-tight">Earn your belts</h2>
          <p className="mx-auto mt-4 max-w-sm text-lg text-white/65">
            Hit milestones in your training and unlock championship belts, from gold to diamond.
          </p>
        </Reveal>
        <div className="mt-12">
          <BeltCarousel />
        </div>
      </section>

      {/* Coming soon */}
      <section className="px-6 py-14 text-center">
        <Reveal>
          <h2 className="bg-linear-to-r from-[#c084fc] to-[#f472b6] bg-clip-text text-[clamp(2.6rem,12vw,3.5rem)] md:text-7xl font-semibold leading-[1.05] tracking-tight text-transparent">
            Coming soon
            <br />
            to iPhone
          </h2>
          <p className="mx-auto mt-6 max-w-sm text-lg leading-relaxed text-white/70">
            {"Fight IQ is in the final stretch before launch. Leave your email and we'll tell you the day it lands."}
          </p>
          <div className="mt-9">
            <NotifyButton />
          </div>
        </Reveal>
      </section>

      {/* Honest numbers */}
      <section className="px-6 py-10">
        <Reveal className="text-center">
          <h2 className="text-[clamp(2.2rem,10vw,3rem)] md:text-6xl font-semibold leading-tight tracking-tight">
            One app.
            <br />
            Your whole game.
          </h2>
        </Reveal>
        <Reveal className="mx-auto mt-12 max-w-md rounded-[2.5rem] border border-white/10 px-8 py-2 text-center md:grid md:max-w-3xl md:grid-cols-2 md:px-0">
          {STATS.map((s, i) => (
            <div key={s.title} className={`py-10 md:px-8 ${i > 0 ? "border-t border-white/10 md:border-l md:border-t-0" : ""}`}>
              <div className="bg-linear-to-b from-white to-white/40 bg-clip-text text-[5.5rem] font-medium leading-none text-transparent">
                {s.big}
              </div>
              <div className="mt-4 text-2xl text-white/85">{s.title}</div>
              <p className="mt-3 text-base leading-relaxed text-white/50">{s.body}</p>
            </div>
          ))}
        </Reveal>
        <Reveal className="mx-auto mt-16 max-w-xs">
          <h3 className="text-center text-lg font-semibold">{"What's inside"}</h3>
          <ul className="mt-6 space-y-5">
            {INSIDE.map((item) => (
              <li key={item} className="flex items-center gap-4 text-lg text-white/85">
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
                  <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16 pt-12 text-center">
        <Reveal>
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[1.6rem] border border-white/10 bg-neutral-900 shadow-[0_0_80px_rgba(168,85,247,0.35)]">
            <Image src="/logo-small.png" alt="" width={56} height={56} className="h-14 w-auto" />
          </div>
          <h2 className="mt-10 text-[clamp(2.6rem,12vw,3.5rem)] md:text-7xl font-semibold leading-[1.05] tracking-tight">
            Train smart.
            <br />
            Fight smarter.
          </h2>
          <div className="mt-10">
            <NotifyButton />
          </div>
        </Reveal>
      </section>
    </div>
  );
}
