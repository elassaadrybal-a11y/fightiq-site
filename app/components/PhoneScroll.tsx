"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";

const DEFAULT_SCREEN = "/screens/dashboard.png";
const LAYERS = 20;

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
  },
  {
    side: "left",
    kicker: "Opponent scanner",
    title: "Scout your next opponent.",
    text: "Tendencies, openings and a game plan to train against.",
  },
  {
    side: "right",
    kicker: "Training score",
    title: "Show up, log it, watch it add up.",
    text: "A score and streaks that reward consistency, plus team leaderboards.",
  },
];

const screens = Array.from(new Set(beats.map((b) => b.screen ?? DEFAULT_SCREEN)));

// One pose per text block, in degrees. The first pose matches the starting
// angles in globals.css so there's no jump when the page loads.
type Pose = { ry: number; rx: number; rz: number };

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

// Glossy black body: a highlight at the top and bottom of the side wall,
// darker toward the middle, with lighter rim and band layers.
const BODY_BACKGROUND =
  "linear-gradient(90deg, #18171d 0%, #1f1e25 50%, #18171d 100%)";
const RIM_BACKGROUND =
  "linear-gradient(90deg, #2c2b33 0%, #22212a 50%, #2c2b33 100%)";
const BAND_BACKGROUND =
  "linear-gradient(90deg, #26252d 0%, #1c1b22 50%, #26252d 100%)";
const BUTTON_BACKGROUND =
  "linear-gradient(180deg, #2b2a32 0%, #1e1d24 50%, #2b2a32 100%)";
const BUTTON_CAP = "#2d2c35";

// Positions and heights as a fraction of the phone's height
const BUTTONS = [
  { side: "left", top: 0.17, height: 0.035 },
  { side: "left", top: 0.235, height: 0.07 },
  { side: "left", top: 0.325, height: 0.07 },
  { side: "right", top: 0.28, height: 0.105 },
] as const;

function SideButton({
  side,
  top,
  height,
}: {
  side: "left" | "right";
  top: number;
  height: number;
}) {
  const D = "calc(var(--depth) * 0.42)";
  const face: CSSProperties = {
    position: "absolute",
    background: BUTTON_BACKGROUND,
    backfaceVisibility: "hidden",
    borderRadius: "calc(var(--w) * 0.006)",
  };
  const cap: CSSProperties = { ...face, background: BUTTON_CAP };
  const outerX =
    side === "left" ? `calc(${D} / -2)` : `calc(100% - ${D} / 2)`;

  return (
    <div
      style={{
        position: "absolute",
        top: `${top * 100}%`,
        height: `calc(var(--w) * 2.1667 * ${height})`,
        width: "calc(var(--w) * 0.02)",
        ...(side === "left"
          ? { left: "calc(var(--w) * -0.016)" }
          : { right: "calc(var(--w) * -0.016)" }),
        transformStyle: "preserve-3d",
      }}
    >
      <div
        style={{ ...face, inset: 0, transform: `translateZ(calc(${D} / 2))` }}
      />
      <div
        style={{
          ...face,
          inset: 0,
          transform: `translateZ(calc(${D} / -2)) rotateY(180deg)`,
        }}
      />
      <div
        style={{
          ...face,
          top: 0,
          height: "100%",
          width: D,
          left: outerX,
          transform: side === "left" ? "rotateY(-90deg)" : "rotateY(90deg)",
        }}
      />
      <div
        style={{
          ...cap,
          left: 0,
          width: "100%",
          height: D,
          top: `calc(${D} / -2)`,
          transform: "rotateX(90deg)",
        }}
      />
      <div
        style={{
          ...cap,
          left: 0,
          width: "100%",
          height: D,
          top: `calc(100% - ${D} / 2)`,
          transform: "rotateX(-90deg)",
        }}
      />
    </div>
  );
}

function Phone({
  activeScreen,
  rotatorRef,
  glareRef,
  staticTransform,
}: {
  activeScreen: string;
  rotatorRef?: RefObject<HTMLDivElement | null>;
  glareRef?: RefObject<HTMLDivElement | null>;
  staticTransform?: string;
}) {
  const radius = "calc(var(--w) * 0.16)";

  return (
    <div
      style={{
        position: "relative",
        width: "var(--w)",
        height: "calc(var(--w) * 2.1667)",
        perspective: "var(--persp)",
      }}
    >

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
        {Array.from({ length: LAYERS }, (_, i) => {
          const isRim = i === 0 || i === LAYERS - 1;
          const isBand = i === LAYERS / 2 - 1 || i === LAYERS / 2;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                borderRadius: radius,
                transform: `translateZ(calc((${i} - ${(LAYERS - 1) / 2}) * var(--depth) / ${LAYERS - 1}))`,
                background: isRim
                  ? RIM_BACKGROUND
                  : isBand
                    ? BAND_BACKGROUND
                    : BODY_BACKGROUND,
              }}
            />
          );
        })}

        {/* Side buttons */}
        {BUTTONS.map((b) => (
          <SideButton key={`${b.side}-${b.top}`} {...b} />
        ))}

        {/* Back */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            transform:
              "translateZ(calc(var(--depth) / -2 - 1.5px)) rotateY(180deg)",
            backfaceVisibility: "hidden",
            background: "linear-gradient(135deg, #1c1b22, #111016)",
          }}
        />

        {/* Front: bezel and screen */}
        <div
          className="absolute inset-0"
          style={{
            borderRadius: radius,
            transform: "translateZ(calc(var(--depth) / 2 + 1.5px))",
            backfaceVisibility: "hidden",
            background: "#000000",
            boxShadow:
              "inset 0 0 0 calc(var(--w) * 0.012) #0e0d12, inset 0 0 0 calc(var(--w) * 0.014) #1f1e26",
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
                  "linear-gradient(120deg, rgba(255,255,255,0.18), transparent 40%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
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
          beat.side === "left"
            ? "md:items-end md:text-right"
            : "md:items-start md:text-left"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">
          {beat.kicker}
        </p>
        <Heading className="mt-3 text-2xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-4xl">
          {beat.title}
        </Heading>
        <p className="mt-3 max-w-sm text-sm text-[#b9b6c4] md:mt-4 md:text-base md:text-muted">
          {beat.text}
        </p>
        {beat.cta && (
          <div className="mt-5 flex flex-wrap justify-center gap-3 md:mt-6 md:justify-end">
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

    const startPose = (
      window.innerWidth < 768 ? POSES_MOBILE : POSES_DESKTOP
    )[0];
    const current: Pose = { ...startPose };
    let target: Pose = { ...startPose };
    let tickFrame = 0;
    let updateFrame = 0;

    const apply = (pose: Pose) => {
      const rotator = rotatorRef.current;
      if (rotator) {
        rotator.style.transform = `rotateY(${pose.ry}deg) rotateX(${pose.rx}deg) rotateZ(${pose.rz}deg)`;
      }
      const glare = glareRef.current;
      if (glare) {
        glare.style.background = `linear-gradient(${
          120 - pose.ry * 1.2
        }deg, rgba(255,255,255,0.18), transparent 40%)`;
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
      {/* Phone track: the phone sticks in the middle while the text scrolls */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          ref={stageRef}
          className="sticky top-0 flex h-svh items-start justify-center pt-[5.25rem] md:items-center md:pt-16"
        >
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(139,31,224,0.30),transparent_70%)]" />
          <Phone
            activeScreen={activeScreen}
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
