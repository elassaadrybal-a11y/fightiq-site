"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

const DEFAULT_SCREEN = "/screens/dashboard.png";
const LAYERS = 20;

type Beat = {
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
    kicker: "AI boxing analysis",
    title: "Your sparring, watched like a coach saw every second.",
    text: "Upload your footage. Get a breakdown of your habits, openings and drills in minutes.",
    cta: true,
  },
  {
    kicker: "Sparring analysis",
    title: "See the patterns you can't feel mid-round.",
    text: "Strengths, recurring habits and drills pulled from your own footage.",
  },
  {
    kicker: "Opponent scanner",
    title: "Scout your next opponent.",
    text: "Tendencies, openings and a game plan to train against.",
  },
  {
    kicker: "Training score",
    title: "Show up, log it, watch it add up.",
    text: "A score and streaks that reward consistency, plus team leaderboards.",
  },
];

const screens = Array.from(new Set(beats.map((b) => b.screen ?? DEFAULT_SCREEN)));

// One pose per text block: angles in degrees, x is the sideways shift
// (0 = centred, 1 = full shift to the right), s is scale.
type Pose = { ry: number; rx: number; rz: number; x: number; s: number };

const POSES_DESKTOP: Pose[] = [
  { ry: -32, rx: 10, rz: -4, x: 0, s: 1 },
  { ry: -20, rx: 6, rz: -3, x: 1, s: 1.02 },
  { ry: -8, rx: 3, rz: -1, x: 1, s: 1.04 },
  { ry: 10, rx: 2, rz: 2, x: 1, s: 1.02 },
];

const POSES_MOBILE: Pose[] = [
  { ry: -22, rx: 8, rz: -3, x: 0, s: 1 },
  { ry: -14, rx: 5, rz: -2, x: 1, s: 1 },
  { ry: -5, rx: 3, rz: -1, x: 1, s: 1 },
  { ry: 8, rx: 2, rz: 1, x: 1, s: 1 },
];

const INITIAL_TRANSFORM =
  "rotateY(var(--ry0)) rotateX(var(--rx0)) rotateZ(var(--rz0))";

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const mix = (a: Pose, b: Pose, g: number): Pose => ({
  ry: a.ry + (b.ry - a.ry) * g,
  rx: a.rx + (b.rx - a.rx) * g,
  rz: a.rz + (b.rz - a.rz) * g,
  x: a.x + (b.x - a.x) * g,
  s: a.s + (b.s - a.s) * g,
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

const RIM_BACKGROUND =
  "linear-gradient(90deg, #8a8697 0%, #3a3745 14%, #2a2833 50%, #3a3745 86%, #8a8697 100%)";
const BODY_BACKGROUND =
  "linear-gradient(90deg, #5a5668 0%, #24222c 14%, #1a1822 50%, #24222c 86%, #5a5668 100%)";

function Phone({
  activeScreen,
  shifterRef,
  rotatorRef,
  glareRef,
  staticTransform,
}: {
  activeScreen: string;
  shifterRef?: RefObject<HTMLDivElement | null>;
  rotatorRef?: RefObject<HTMLDivElement | null>;
  glareRef?: RefObject<HTMLDivElement | null>;
  staticTransform?: string;
}) {
  const radius = "calc(var(--w) * 0.16)";

  return (
    <div
      ref={shifterRef}
      style={{
        position: "relative",
        width: "var(--w)",
        height: "calc(var(--w) * 2.1667)",
        perspective: "var(--persp)",
        willChange: "transform",
      }}
    >
      {/* Soft glow on the ground under the phone */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "calc(var(--w) * -0.1)",
          width: "calc(var(--w) * 0.9)",
          height: "calc(var(--w) * 0.14)",
          background:
            "radial-gradient(ellipse at center, rgba(139,31,224,0.40), transparent 70%)",
        }}
      />

      <div
        ref={rotatorRef}
        style={{
          position: "absolute",
          inset: 0,
          transform: staticTransform ?? INITIAL_TRANSFORM,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Body: stacked layers give the phone its thickness */}
        {Array.from({ length: LAYERS }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              borderRadius: radius,
              transform: `translateZ(calc((${i} - ${(LAYERS - 1) / 2}) * var(--depth) / ${LAYERS - 1}))`,
              background:
                i === 0 || i === LAYERS - 1 ? RIM_BACKGROUND : BODY_BACKGROUND,
            }}
          />
        ))}

        {/* Side buttons */}
        <div
          className="absolute"
          style={{
            left: "calc(var(--w) * -0.011)",
            top: "19%",
            width: "calc(var(--w) * 0.013)",
            height: "4%",
            borderRadius: 2,
            background: "#4a4757",
          }}
        />
        <div
          className="absolute"
          style={{
            left: "calc(var(--w) * -0.011)",
            top: "26%",
            width: "calc(var(--w) * 0.013)",
            height: "8%",
            borderRadius: 2,
            background: "#4a4757",
          }}
        />
        <div
          className="absolute"
          style={{
            right: "calc(var(--w) * -0.011)",
            top: "28%",
            width: "calc(var(--w) * 0.013)",
            height: "11%",
            borderRadius: 2,
            background: "#4a4757",
          }}
        />

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            transform:
              "translateZ(calc(var(--depth) / -2 - 1.5px)) rotateY(180deg)",
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #2a2833, #14121a)",
          }}
        />

        {/* Front: bezel and screen */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            transform: "translateZ(calc(var(--depth) / 2 + 1.5px))",
            backfaceVisibility: "hidden",
            background: "#0b0a0f",
            boxShadow: "inset 0 0 0 calc(var(--w) * 0.012) #3a3745",
          }}
        >
          <div
            className="absolute overflow-hidden"
            style={{
              inset: "calc(var(--w) * 0.03)",
              borderRadius: "calc(var(--w) * 0.13)",
            }}
          >
            {screens.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={src === activeScreen ? "Fight IQ app preview" : ""}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 70vw, 340px"
                className={`object-cover object-top transition-opacity duration-500 ${
                  src === activeScreen ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div
              ref={glareRef}
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.14), transparent 38%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BeatText({
  beat,
  active,
  shifted,
}: {
  beat: Beat;
  active: boolean;
  shifted: boolean;
}) {
  const Heading = beat.cta ? "h1" : "h2";
  return (
    <div className={`beat-side w-full ${shifted ? "beat-shifted" : ""}`}>
      <div
        className={`beat-card flex flex-col items-center text-center transition-all duration-700 ease-out md:items-start md:text-left ${
          active
            ? "translate-x-0 opacity-100"
            : "-translate-x-8 opacity-0 md:-translate-x-6 md:opacity-25"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">
          {beat.kicker}
        </p>
        <Heading className="mt-3 text-2xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
          {beat.title}
        </Heading>
        <p className="mt-3 max-w-sm text-sm text-[#b9b6c4] md:mt-4 md:text-base md:text-muted">
          {beat.text}
        </p>
        {beat.cta && (
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-6 md:justify-start">
            <a
              href="#products"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-glow"
            >
              See what you get
            </a>
            <a
              href="#notify"
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
  const shifterRef = useRef<HTMLDivElement>(null);
  const rotatorRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let target: Pose = POSES_DESKTOP[0];
    const current: Pose = { ...POSES_DESKTOP[0] };
    let tickFrame = 0;
    let updateFrame = 0;

    const apply = (pose: Pose) => {
      const rotator = rotatorRef.current;
      if (rotator) {
        rotator.style.transform = `rotateY(${pose.ry}deg) rotateX(${pose.rx}deg) rotateZ(${pose.rz}deg) scale(${pose.s})`;
      }
      const shifter = shifterRef.current;
      if (shifter) {
        shifter.style.transform = `translate3d(calc(var(--shift) * ${pose.x}), 0px, 0px)`;
      }
      const glare = glareRef.current;
      if (glare) {
        glare.style.background = `linear-gradient(${
          120 - pose.ry * 1.2
        }deg, rgba(255,255,255,0.14), transparent 38%)`;
      }
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
      // The sticky stage is exactly one small-viewport tall, so this doesn't
      // change when mobile browser toolbars slide in and out.
      const stageH = stageRef.current?.offsetHeight ?? window.innerHeight;
      const isMobile = window.innerWidth < 768;
      const poses = isMobile ? POSES_MOBILE : POSES_DESKTOP;
      const pick = (i: number) => poses[Math.min(i, poses.length - 1)];
      const s = -rect.top;

      // The scroll position at which each text block is "in focus"
      const anchors = beatRefs.current.map((el) =>
        el
          ? isMobile
            ? el.offsetTop
            : el.offsetTop + el.offsetHeight / 2 - stageH / 2
          : 0,
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
      <section id="top" className="relative overflow-hidden pb-20 pt-28">
        <div className="phone-vars mx-auto flex max-w-3xl flex-col items-center gap-12 px-6">
          <Phone
            activeScreen={DEFAULT_SCREEN}
            staticTransform="rotateY(-12deg) rotateX(4deg) rotateZ(-2deg)"
          />
          {beats.map((b) => (
            <div key={b.title} className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">
                {b.kicker}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {b.title}
              </h2>
              <p className="mx-auto mt-4 max-w-sm text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  const activeScreen = beats[active].screen ?? DEFAULT_SCREEN;

  return (
    <section
      id="top"
      ref={sectionRef}
      className="phone-vars relative isolate overflow-x-clip"
    >
      {/* Phone track: the phone sticks while the text scrolls over it */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          ref={stageRef}
          className="sticky top-0 flex h-svh items-start justify-center pt-[5.25rem] md:items-center md:pt-16"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(139,31,224,0.30),transparent_70%)]" />
          <Phone
            activeScreen={activeScreen}
            shifterRef={shifterRef}
            rotatorRef={rotatorRef}
            glareRef={glareRef}
          />
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
            className="flex min-h-svh items-end pb-5 md:min-h-[85svh] md:items-center md:justify-start md:pb-0"
          >
            <BeatText beat={b} active={i === active} shifted={i > 0} />
          </div>
        ))}
      </div>
    </section>
  );
}
