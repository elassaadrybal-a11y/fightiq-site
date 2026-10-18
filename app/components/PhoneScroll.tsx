"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";

const DEFAULT_SCREEN = "/screens/dashboard.png";
const LAYERS = 14;

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

const PHONE_TRANSFORM =
  "perspective(var(--persp)) rotateY(calc(var(--ry0) + var(--p) * var(--ryr))) rotateX(calc(var(--rx0) + var(--p) * var(--rxr))) rotateZ(calc(var(--rz0) + var(--p) * var(--rzr)))";

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

function Phone({ activeScreen }: { activeScreen: string }) {
  const radius = "calc(var(--w) * 0.16)";

  return (
    <div
      style={{
        position: "relative",
        width: "var(--w)",
        height: "calc(var(--w) * 2.1667)",
        transform: PHONE_TRANSFORM,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Body: stacked layers give the phone its thickness */}
      {Array.from({ length: LAYERS }, (_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={
            {
              "--i": i,
              borderRadius: radius,
              transform: `translateZ(calc((var(--i) - ${(LAYERS - 1) / 2}) * var(--depth) / ${LAYERS - 1}))`,
              background:
                "linear-gradient(90deg, #5a5668 0%, #24222c 14%, #1a1822 50%, #24222c 86%, #5a5668 100%)",
            } as CSSProperties
          }
        />
      ))}

      {/* Back */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          transform: "translateZ(calc(var(--depth) / -2 - 0.5px)) rotateY(180deg)",
          background: "linear-gradient(135deg, #2a2833, #14121a)",
        }}
      />

      {/* Front: bezel and screen */}
      <div
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          transform: "translateZ(calc(var(--depth) / 2 + 0.5px))",
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
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(calc(110deg + var(--p) * 50deg), rgba(255,255,255,0.14), transparent 38%)",
            }}
          />
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
        <Heading className="mt-3 text-2xl font-semibold leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
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

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      section.style.setProperty("--p", p.toFixed(4));

      let best = 0;
      if (window.innerWidth < 768) {
        // Phones: every beat is one screen tall, the card sits at its bottom
        const h = beatRefs.current[0]?.offsetHeight || window.innerHeight;
        best = Math.min(
          beats.length - 1,
          Math.max(0, Math.floor(-rect.top / h + 0.19)),
        );
      } else {
        const focus = window.innerHeight * 0.5;
        let bestDist = Infinity;
        beatRefs.current.forEach((el, i) => {
          if (!el) return;
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - focus);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
      }
      setActive((current) => (current === best ? current : best));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section id="top" className="relative overflow-hidden pb-20 pt-28">
        <div
          style={{ "--p": 0.5 } as CSSProperties}
          className="phone-vars mx-auto flex max-w-3xl flex-col items-center gap-12 px-6"
        >
          <Phone activeScreen={DEFAULT_SCREEN} />
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
      style={{ "--p": 0 } as CSSProperties}
      className="phone-vars relative isolate overflow-x-clip"
    >
      {/* Phone track: the phone sticks while the text scrolls over it */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="sticky top-0 flex h-svh items-start justify-center pt-[5.25rem] md:items-center md:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(139,31,224,0.30),transparent_70%)]" />
          <div className="flex flex-col items-center">
            <Phone activeScreen={activeScreen} />
            <p className="mt-4 hidden text-center text-[11px] uppercase tracking-[0.2em] text-muted md:block">
              App preview · sample data
            </p>
          </div>
          <p className="absolute inset-x-0 top-[4.4rem] text-center text-[10px] uppercase tracking-[0.2em] text-muted md:hidden">
            App preview · sample data
          </p>
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
