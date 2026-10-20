"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site } from "../site";
import type { Pose } from "./PhoneCanvas";

const PhoneCanvas = dynamic(() => import("./PhoneCanvas"), { ssr: false });

const DEFAULT_SCREEN = "/screens/dashboard.png";

type Beat = {
  side: "left" | "right";
  kicker: string;
  title: string;
  text: string;
  screen?: string;
  cta?: boolean;
};

// Add a `screen` to any beat once you have more screenshots,
// for example screen: "/screens/scanner.png".
const beats: Beat[] = [
  {
    side: "left",
    kicker: "AI boxing analysis",
    title: "Your sparring, watched like a coach saw every second.",
    text: "Upload your footage. Get a breakdown of your habits, openings and drills in minutes.",
    cta: true,
  },
  {
    side: "right",
    kicker: "Sparring analysis",
    title: "See the patterns you can't feel mid-round.",
    text: "Strengths, recurring habits and drills pulled from your own footage.",
    screen: "/screens/sparring-upload.png",
  },
  {
    side: "left",
    kicker: "Opponent scanner",
    title: "Scout your next opponent.",
    text: "Tendencies, openings and a game plan to train against.",
    screen: "/screens/scanner.png",
  },
  {
    side: "right",
    kicker: "Training score",
    title: "Show up, log it, watch it add up.",
    text: "A score and streaks that reward consistency, plus team leaderboards.",
    screen: "/screens/profile.png",
  },
];

const screens = Array.from(new Set(beats.map((b) => b.screen ?? DEFAULT_SCREEN)));

// One pose per text block, in degrees
const POSES_DESKTOP: Pose[] = [
  { ry: -32, rx: 10, rz: -4 },
  { ry: -12, rx: 5, rz: -2 },
  { ry: 10, rx: 3, rz: 1 },
  { ry: 30, rx: 2, rz: 3 },
];

const POSES_MOBILE: Pose[] = [
  { ry: -22, rx: 8, rz: -3 },
  { ry: -8, rx: 4, rz: -1 },
  { ry: 8, rx: 3, rz: 1 },
  { ry: 20, rx: 2, rz: 2 },
];

const STATIC_POSE: Pose = { ry: -12, rx: 4, rz: -2 };

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const mix = (a: Pose, b: Pose, g: number): Pose => ({
  ry: a.ry + (b.ry - a.ry) * g,
  rx: a.rx + (b.rx - a.rx) * g,
  rz: a.rz + (b.rz - a.rz) * g,
});

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerReducedMotion() {
  return false;
}

function BeatText({ beat, active }: { beat: Beat; active: boolean }) {
  const Heading = beat.cta ? "h1" : "h2";
  return (
    <div
      className={`beat-side w-full transition-opacity duration-500 ${
        active ? "md:opacity-100" : "md:opacity-30"
      }`}
    >
      <div
        className={`beat-card flex flex-col items-center text-center ${
          beat.side === "left" ? "md:items-end md:text-right" : "md:items-start md:text-left"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">{beat.kicker}</p>
        <Heading className="mt-3 text-2xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-4xl">
          {beat.title}
        </Heading>
        <p className="mt-3 max-w-sm text-sm text-[#b9b6c4] md:mt-4 md:text-base md:text-muted">{beat.text}</p>
        {beat.cta && (
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-6 md:justify-end">
            <a
              href="/products"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-glow"
            >
              See what you get
            </a>
            <a
              href={`mailto:${site.contactEmail}?subject=Notify%20me%20about%20launch`}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition hover:bg-surface"
            >
              Get notified
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PhoneScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const poseRef = useRef<Pose>({ ...POSES_DESKTOP[0] });
  const staticPoseRef = useRef<Pose>({ ...STATIC_POSE });
  const [active, setActive] = useState(0);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerReducedMotion);

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    const startPose = (window.innerWidth < 768 ? POSES_MOBILE : POSES_DESKTOP)[0];
    const current: Pose = { ...startPose };
    let target: Pose = { ...startPose };
    let tickFrame = 0;
    let updateFrame = 0;

    const apply = (pose: Pose) => {
      poseRef.current = { ...pose };
    };

    // Ease toward the target pose so uneven scroll events don't show as jitter
    const tick = () => {
      tickFrame = 0;
      let settled = true;
      (Object.keys(current) as (keyof Pose)[]).forEach((k) => {
        const d = target[k] - current[k];
        if (Math.abs(d) < 0.001) {
          current[k] = target[k];
        } else {
          current[k] += d * 0.16;
          settled = false;
        }
      });
      apply(current);
      if (!settled) tickFrame = requestAnimationFrame(tick);
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const stageH = stageRef.current?.offsetHeight ?? window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const poses = isMobile ? POSES_MOBILE : POSES_DESKTOP;
      const pick = (i: number) => poses[Math.min(i, poses.length - 1)];
      const s = -rect.top;

      // The scroll position at which each text block is "in focus"
      const anchors = beatRefs.current.map((el) =>
        el ? (isMobile ? el.offsetTop : el.offsetTop + el.offsetHeight / 2 - stageH / 2) : 0,
      );
      const last = anchors.length - 1;

      let index = 0;
      while (index < last && s >= anchors[index + 1]) index++;

      let best = index;
      if (s <= anchors[0]) {
        target = pick(0);
        best = 0;
      } else if (index >= last) {
        target = pick(last);
        best = last;
      } else {
        const f = (s - anchors[index]) / (anchors[index + 1] - anchors[index]);
        const g = isMobile ? smooth(0.4, 0.95, f) : smooth(0.25, 0.75, f);
        target = mix(pick(index), pick(index + 1), g);
        best = f < (isMobile ? 0.8 : 0.5) ? index : index + 1;
      }

      if (!tickFrame) tickFrame = requestAnimationFrame(tick);
      setActive((cur) => (cur === best ? cur : best));
    };

    const onScroll = () => {
      if (updateFrame) return;
      updateFrame = requestAnimationFrame(() => {
        updateFrame = 0;
        update();
      });
    };

    apply(current);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (tickFrame) cancelAnimationFrame(tickFrame);
      if (updateFrame) cancelAnimationFrame(updateFrame);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="relative overflow-hidden pb-20 pt-28">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-12 px-6">
          <div className="h-[70svh] w-full">
            <PhoneCanvas poseRef={staticPoseRef} screens={screens} activeScreen={DEFAULT_SCREEN} />
          </div>
          {beats.map((b) => (
            <div key={b.title} className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">{b.kicker}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{b.title}</h2>
              <p className="mx-auto mt-4 max-w-sm text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const activeScreen = beats[active].screen ?? DEFAULT_SCREEN;

  return (
    <section ref={sectionRef} className="phone-vars relative isolate overflow-x-clip">
      {/* Phone track: the phone sticks in the middle while the text scrolls */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div ref={stageRef} className="sticky top-0 h-svh">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(139,31,224,0.30),transparent_70%)]" />
          <div className="absolute inset-0 pt-16">
            <PhoneCanvas poseRef={poseRef} screens={screens} activeScreen={activeScreen} />
          </div>
        </div>
      </div>

      {/* Text beats scroll normally, above the phone */}
      <div className="relative z-20 mx-auto max-w-6xl px-6">
        {beats.map((b, i) => (
          <div
            key={b.title}
            ref={(el) => {
              beatRefs.current[i] = el;
            }}
            className={`flex min-h-svh items-end pb-5 md:min-h-[85svh] md:items-center md:pb-0 ${
              b.side === "left" ? "md:justify-start" : "md:justify-end"
            }`}
          >
            <BeatText beat={b} active={i === active} />
          </div>
        ))}
      </div>
    </section>
  );
}
