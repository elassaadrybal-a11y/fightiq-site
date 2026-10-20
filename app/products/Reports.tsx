"use client";

import { useId, useState, type ReactNode } from "react";

/* ---------- Shared styles ---------- */

const STYLES =
  ".fiq-d{font-family:var(--fiq-display),ui-sans-serif,system-ui,sans-serif;letter-spacing:-0.03em}.fiq-s{font-family:var(--fiq-sans),ui-sans-serif,system-ui,sans-serif}.fiq-m{font-family:var(--fiq-mono),ui-monospace,monospace}";

const CARD = "rounded-[1.75rem] border border-white/[0.08] bg-[#0f0e14]";
const INNER = "rounded-2xl bg-white/[0.04]";
const LABEL = "fiq-m text-[11px] uppercase tracking-[0.3em]";
const PURPLE = "text-[#8b5cf6]";

/* ---------- Icons (line icons, 24px grid) ---------- */

const ICONS = {
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  alert: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  trendingUp: (
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>
  ),
  bulb: (
    <>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  wind: (
    <>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </>
  ),
  flame: (
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  ),
  timer: (
    <>
      <path d="M10 2h4" />
      <path d="M12 14l3-3" />
      <circle cx="12" cy="14" r="8" />
    </>
  ),
  sparkles: (
    <>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
    </>
  ),
  shieldAlert: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M22 12h-4" />
      <path d="M6 12H2" />
      <path d="M12 6V2" />
      <path d="M12 22v-4" />
    </>
  ),
  hand: (
    <>
      <path d="M18 11V6a2 2 0 0 0-4 0v1" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  play: <polygon points="6 3 20 12 6 21 6 3" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </>
  ),
  chevronUp: <path d="m18 15-6-6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  skull: (
    <>
      <path d="m12.5 17-.5-1-.5 1h1z" />
      <path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="12" r="1" />
    </>
  ),
  dot: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
};

type IconName = keyof typeof ICONS;

function Icon({ name, size = 20, className = "" }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ---------- Shared building blocks ---------- */

function ReportFrame({ children }: { children: ReactNode }) {
  return (
    <div className="fiq-s relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#060509] px-5 pb-10 pt-10 text-white">
      <style>{STYLES}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{ background: "radial-gradient(80% 100% at 50% 0%, rgba(124,58,237,0.35), transparent 70%)" }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function Ring({ value, size, children }: { value: number; size: number; children: ReactNode }) {
  const gid = `ring${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f87171" />
            <stop offset="1" stopColor="#be123c" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function SectionNum({ n, title }: { n: string; title: string }) {
  return (
    <div className="mb-5 mt-12">
      <p className={`${LABEL} text-[#7c3aed]`}>{n}</p>
      <h2 className="fiq-d mt-1 text-[1.9rem] font-bold leading-tight">{title}</h2>
    </div>
  );
}

function SectionLabel({ n, label, title, sub }: { n: string; label: string; title: string; sub?: string }) {
  return (
    <div className="mb-5 mt-12">
      <p className={LABEL}>
        <span className="text-[#7c3aed]/60">{n}</span> <span className={PURPLE}>{label}</span>
      </p>
      <h2 className="fiq-d mt-2 text-[1.6rem] font-bold leading-tight">{title}</h2>
      {sub ? <p className="mt-1 text-[15px] text-white/55">{sub}</p> : null}
    </div>
  );
}

function IconBadge({ name, tone = "purple", size = 40 }: { name: IconName; tone?: "purple" | "white"; size?: number }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full ${
        tone === "purple" ? "bg-[#7c3aed]/15 text-[#8b5cf6]" : "bg-white/[0.06] text-white"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={size * 0.45} />
    </div>
  );
}

function IconGrid({ items, icon, tone = "purple" }: { items: string[]; icon: IconName; tone?: "purple" | "white" }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((t) => (
        <div key={t} className={`${CARD} p-4`}>
          <IconBadge name={icon} tone={tone} />
          <p className="fiq-d mt-3 text-[15px] font-semibold leading-snug">{t}</p>
        </div>
      ))}
    </div>
  );
}

function RowCards({
  items,
  icon,
  iconClass = PURPLE,
  border = "border-white/[0.08]",
}: {
  items: string[];
  icon: IconName;
  iconClass?: string;
  border?: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <div key={t} className={`flex items-start gap-3 rounded-[1.5rem] border ${border} bg-[#0f0e14] p-5`}>
          <Icon name={icon} size={18} className={`mt-0.5 shrink-0 ${iconClass}`} />
          <p className="text-[15px] leading-relaxed text-white/90">{t}</p>
        </div>
      ))}
    </div>
  );
}

function Bars({ items }: { items: [string, number][] }) {
  return (
    <div className={`${CARD} space-y-4 p-5`}>
      {items.map(([name, v]) => (
        <div key={name}>
          <div className="flex justify-between text-[15px]">
            <span className="text-white/60">{name}</span>
            <span className="fiq-m">{v}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-linear-to-r from-[#7c3aed] to-[#6d28d9]" style={{ width: `${v}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AppButtons({ primary }: { primary: string }) {
  return (
    <div className="mt-12 space-y-3" aria-hidden="true">
      <div className="flex h-14 items-center justify-center gap-3 rounded-full bg-linear-to-r from-[#7c3aed] to-[#4c1d95] text-[17px] font-medium shadow-[0_0_40px_rgba(124,58,237,0.35)]">
        <Icon name="play" />
        {primary}
      </div>
      <div className="flex h-14 items-center justify-center gap-3 rounded-full border border-white/10 bg-[#0f0e14] text-[17px]">
        <Icon name="share" />
        Share Report
      </div>
      <div className="flex h-14 items-center justify-center gap-3 rounded-full border border-white/10 bg-[#0f0e14] text-[17px]">
        <Icon name="arrowLeft" />
        Back To Dashboard
      </div>
    </div>
  );
}

/* ---------- Sparring Analysis ---------- */

const SP_SUMMARY =
  "The fighter demonstrated a solid, resilient high guard and decent punch tolerance under sustained pressure. However, he spent far too much time backing straight up onto the ropes, giving away ring geometry and allowing his opponent to dictate pace without facing a consistent jab.";

const SP_TIMELINE: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "wind",
    title: "Opening Rounds",
    text: "The round started with both fighters testing range, but the fighter quickly gave up ground, allowing his opponent to advance uncontested behind straight punches.",
  },
  {
    icon: "flame",
    title: "Mid Session",
    text: "Opponent capitalized on forward momentum by pinning the fighter to the ropes, landing body-head combinations while the fighter remained in a defensive shell.",
  },
  {
    icon: "timer",
    title: "Late Rounds",
    text: "Fighter attempted a few sharp counters off the ropes but remained defensively overwhelmed along the perimeter until the final bell.",
  },
  {
    icon: "sparkles",
    title: "Overall Impression",
    text: "A durable, defensively grounded boxer who possesses grit and counter-punch potential, but severely needs footwork and ring craft to avoid being outworked on the ropes.",
  },
];

const SP_STRENGTHS = [
  "Tight high-guard defense that absorbs heavy shots on the arms and gloves",
  "Composure under fire when trapped along the ropes",
  "Willingness to fire sharp straight counters immediately after opponent resets",
  "Good chin tuck and discipline keeping eyes forward while shelled up",
];

const SP_IMPROVE = [
  "Retreating in straight lines directly into the ropes and corners",
  "Low jab output, failing to control distance or disrupt forward pressure",
  "Lack of lateral movement and angle creation to escape trapped positions",
  "Static defensive posture that invites prolonged multi-punch flurries",
];

const SP_DRILLS = [
  "Rope escape pivot drill: practice catching a shot and immediately pivoting 90 degrees off the ropes to take center ring.",
  "Jab-and-circle drill: maintain constant lead hand activity while circling away from the opponent's power side.",
  "Catch-and-shoot mittwork: fire immediate counter right hands or left hooks on the half-beat rather than absorbing full combinations.",
];

const SP_ROUND: { icon: IconName; tone: "purple" | "white"; label: string; text: string }[] = [
  {
    icon: "check",
    tone: "purple",
    label: "Strong Moments",
    text: "Held a tight, composed high guard under sustained flurries and landed a few crisp straight counters in mid-ring.",
  },
  {
    icon: "alert",
    tone: "purple",
    label: "Mistakes",
    text: "Gave up ring center easily, backed up in straight lines, and threw insufficient volume with the lead hand.",
  },
  {
    icon: "target",
    tone: "white",
    label: "Key Adjustment",
    text: "Step laterally and pivot as soon as the opponent steps in rather than backing into the ropes.",
  },
  {
    icon: "bulb",
    tone: "white",
    label: "Coach Recommendation",
    text: "Pump the jab constantly and refuse to let your heels touch the yellow ropes.",
  },
];

const SP_TACTICAL = [
  {
    title: "Distance Management",
    text: "Too reactive at long range; yielded ground immediately whenever the opponent stepped in rather than establishing range with a stiff lead jab.",
  },
  {
    title: "Punch Selection",
    text: "Showed decent straight counters when he did throw, but offense was extremely limited due to spending the majority of rounds defending.",
  },
  {
    title: "Defense",
    text: "High earmuff guard was structurally sound and blocked numerous head shots, but body remained vulnerable and was targeted repeatedly.",
  },
  {
    title: "Counter Timing",
    text: "Timing on single counter right hands showed brief promise, but counters were thrown too late in the exchange.",
  },
  {
    title: "Pressure",
    text: "Failed to generate any forward pressure of his own, allowing the opponent full freedom of movement and initiative.",
  },
  {
    title: "Ring Generalship",
    text: "Poor spatial awareness regarding ring boundaries; consistently drifted toward corners and ropes instead of pivoting back toward center ring.",
  },
];

const SP_HABITS = [
  "Backing up until heels hit the ropes before initiating any offensive counter",
  "Waiting for the opponent to finish full 3-4 punch combinations before reacting",
  "Squaring up feet when pressured against the ropes instead of maintaining a solid staggered base",
];

const SP_MOMENTS = [
  { time: "0:17", title: "Counter Exchange", text: "Fighter slips slightly and fires a sharp right-hand counter as opponent rushes forward.", dim: false },
  { time: "0:52", title: "Rope Pressure", text: "Fighter retreats in a straight line to the ropes and absorbs a flurry while shelled in high guard.", dim: false },
  { time: "2:19", title: "Corner Trap", text: "Opponent pins fighter against the ropes with body shots, exposing fighter's lack of lateral footwork.", dim: false },
  { time: "3:29", title: "Clinch Engagement", text: "Fighter ties up on the inside to smother punches and stall opponent's momentum.", dim: true },
  {
    time: "5:00",
    title: "Late Flurry Defense",
    text: "Fighter weathers a rapid barrage on the ropes right before time is called, sustaining heavy guard discipline.",
    dim: false,
  },
];

const SP_TAKEAWAYS: { icon: IconName; label: string; text: string }[] = [
  { icon: "trophy", label: "Best Weapon", text: "Tight, disciplined high guard shell that minimizes clean head damage." },
  { icon: "trendingUp", label: "Biggest Improvement", text: "Punch absorption and emotional composure while being backed up under heavy pressure." },
  { icon: "bulb", label: "Highest IQ Moment", text: "Timed right-hand counter over the opponent's jab in mid-ring around the 0:17 mark." },
  { icon: "alert", label: "Highest Risk Habit", text: "Backing up in direct straight lines until pinned against the ring ropes." },
  { icon: "target", label: "Priority Next Session", text: "Lateral footwork and active circling to maintain center ring control." },
];

export function SparringReport() {
  const [open, setOpen] = useState(true);

  return (
    <ReportFrame>
      <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
        <span className={`${LABEL} text-white/70`}>AI Analysis Complete</span>
      </span>
      <h1 className="fiq-d mt-5 text-[2.5rem] font-bold leading-none">Sparring Analysis</h1>
      <p className={`${LABEL} mt-4 text-white/55`}>Technical Sparring • 08/10/2026</p>

      <div className={`${CARD} relative mt-8 overflow-hidden px-6 py-8 text-center`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{ background: "radial-gradient(60% 100% at 50% 0%, rgba(124,58,237,0.25), transparent 70%)" }}
        />
        <div className="relative">
          <p className={`${LABEL} text-[#7c3aed]`}>Fight IQ Rating</p>
          <div className="mt-6 flex justify-center">
            <Ring value={62} size={176}>
              <span className="fiq-d text-6xl font-bold leading-none">62</span>
              <span className="fiq-m mt-2 text-sm tracking-[0.2em] text-white/50">/ 100</span>
            </Ring>
          </div>
          <p className="mt-6 text-[15px] leading-relaxed text-white/60">{SP_SUMMARY}</p>
        </div>
      </div>

      <SectionNum n="01" title="Fight Summary" />
      <div className="relative">
        <div aria-hidden="true" className="absolute bottom-8 left-[19px] top-8 w-px bg-linear-to-b from-[#7c3aed]/60 to-white/10" />
        <div className="space-y-4">
          {SP_TIMELINE.map((t, i) => (
            <div key={t.title} className="relative flex gap-3">
              <div className="relative z-10 mt-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0f0e14] text-[#8b5cf6]">
                <Icon name={t.icon} size={18} />
              </div>
              <div className={`${CARD} flex-1 p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="fiq-d text-lg font-semibold leading-snug">{t.title}</h3>
                  <span className="fiq-m pt-1 text-xs text-white/40">{`0${i + 1}`}</span>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-white/55">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionNum n="02" title="Strengths" />
      <IconGrid items={SP_STRENGTHS} icon="zap" />

      <SectionNum n="03" title="Areas To Improve" />
      <IconGrid items={SP_IMPROVE} icon="alert" />

      <SectionNum n="04" title="Recommended Drills" />
      <div className="space-y-3">
        {SP_DRILLS.map((d, i) => (
          <div key={d} className="rounded-[1.75rem] border border-white/[0.08] bg-[#17161d] p-5">
            <p className={`${LABEL} text-[#7c3aed]`}>{`Drill 0${i + 1}`}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/80">{d}</p>
          </div>
        ))}
      </div>

      <SectionNum n="05" title="Round Breakdown" />
      <div className="overflow-hidden rounded-[1.75rem] border border-[#7c3aed]/40 bg-[#0f0e14]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 p-5 text-left"
        >
          <span className="fiq-m flex h-11 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-sm">01</span>
          <span className="flex-1">
            <span className="fiq-d block text-lg font-semibold">Round 1</span>
            <span className="mt-0.5 block text-sm leading-snug text-white/50">
              {"Single continuous sparring round dominated by opponent's ring control and forward pressure against fighter's high guard."}
            </span>
          </span>
          <Icon name={open ? "chevronUp" : "chevronDown"} size={16} className={PURPLE} />
        </button>
        {open && (
          <div className="space-y-5 border-t border-white/[0.08] p-5">
            {SP_ROUND.map((r) => (
              <div key={r.label} className="flex gap-3">
                <IconBadge name={r.icon} tone={r.tone} />
                <div>
                  <p className={`${LABEL} text-white/45`}>{r.label}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-white/85">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SectionNum n="06" title="Tactical Observations" />
      <div className="grid grid-cols-2 gap-3">
        {SP_TACTICAL.map((t) => (
          <div key={t.title} className={`${CARD} p-4`}>
            <IconBadge name="compass" tone="white" />
            <h3 className="fiq-d mt-3 text-[15px] font-semibold leading-snug">{t.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/50">{t.text}</p>
          </div>
        ))}
      </div>

      <SectionNum n="07" title="Recurring Habits" />
      <IconGrid items={SP_HABITS} icon="activity" tone="white" />

      <SectionNum n="08" title="Key Moments" />
      <div className="space-y-3">
        {SP_MOMENTS.map((m) => (
          <div key={m.time} className={`${CARD} flex gap-4 p-5`}>
            <span
              className={`fiq-m h-fit shrink-0 rounded-full px-3 py-1 text-xs ${
                m.dim ? "bg-white/[0.06] text-white/60" : "bg-[#7c3aed]/15 text-[#8b5cf6]"
              }`}
            >
              {m.time}
            </span>
            <div>
              <h3 className="text-[16px] font-medium">{m.title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-white/50">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionNum n="09" title="Key Takeaways" />
      <div className="grid grid-cols-2 gap-3">
        {SP_TAKEAWAYS.map((t) => (
          <div key={t.label} className={`${CARD} p-4`}>
            <p className={`${LABEL} flex items-start gap-2 text-[10px] text-[#7c3aed]`}>
              <Icon name="dot" size={14} className="mt-px shrink-0" />
              {t.label}
            </p>
            <div className="mt-3 flex h-11 w-9 items-center justify-center rounded-full bg-[#7c3aed]/15 text-[#8b5cf6]">
              <Icon name={t.icon} size={18} />
            </div>
            <p className="fiq-d mt-3 text-[15px] font-semibold leading-snug">{t.text}</p>
          </div>
        ))}
      </div>

      <AppButtons primary="Watch Sparring" />
    </ReportFrame>
  );
}

/* ---------- Opponent Intelligence Report ---------- */

const OP_SUMMARY =
  "The fighter in orange shorts is an aggressive orthodox front-foot pressure fighter who constantly pushes the pace and looks to trap opponents along the ropes. While he maintains good offensive initiative and solid punch selection at mid-range, he often steps forward on straight lines with his head upright, leaving him open to counters.";

const OP_TACTICS: [string, number][] = [
  ["Pressure", 78],
  ["Volume", 72],
  ["Defense", 58],
  ["Footwork", 65],
  ["Gas Tank", 70],
];

const OP_STRENGTHS = [
  { title: "Relentless Forward Pressure", text: "Consistently advances and cuts off space, successfully trapping opponents against the ropes." },
  { title: "Effective Straight Right Hand", text: "Times his straight right hand effectively both upstairs and to the body off the jab." },
  { title: "Sustained Flurries on the Ropes", text: "Increases punch output quickly once he senses his opponent is pinned against the ropes." },
];

const OP_WEAKNESSES = [
  "Linear footwork makes him predictable to lateral movement and angle changes.",
  "Leaves his head stationary after completing offensive combinations.",
  "Vulnerable to counter hooks when lunging in to close distance.",
];

const OP_HABITS = [
  "Steps forward aggressively in linear bursts when initiating attacks.",
  "Dips at the waist when trying to evade incoming return shots on the inside.",
  "Resets his stance directly backward into mid-range after delivering flurries.",
];

const OP_COMBOS = ["Jab - Cross to the body - Lead hook upstairs", "Double jab - Straight right hand", "1-2 - Left hook"];

const OP_DEFENSE = [
  "Relies on a high guard but keeps elbows slightly flared.",
  "Tucks chin and ducks forward under hooks rather than stepping off the line.",
  "Absorbs return shots on the gloves while walking through punches.",
];

const OP_OFFENSE = [
  "Routinely leads with straight punches to set up infighting.",
  "Targets the solar plexus and ribs with straight right hands.",
  "Doubles up punches on the ropes to overwhelm defensive guards.",
];

const OP_RANGE: [string, number][] = [
  ["Long Range", 25],
  ["Mid Range", 50],
  ["Inside Fighting", 25],
];

const OP_PLAYBOOK = [
  {
    title: "Check Hook - Pivot - Straight Right",
    steps: ["Check hook", "Pivot off angle", "Straight right"],
    when: "When he rushes forward linearly with his 1-2.",
    result: "Catches him off balance and escapes off the ropes.",
  },
  {
    title: "Slip - Body Hook - Uppercut",
    steps: ["Slip outside jab", "Lead hook to liver", "Rear uppercut"],
    when: "When he steps in with a stiff lead jab.",
    result: "Punishes his body and splits his high guard as he leans in.",
  },
];

const PLAN_A = [
  "Use constant lateral movement and circle toward his lead hand to deny him straight forward charges.",
  "Time the check hook whenever he commits forward with his right hand.",
  "Establish a stiff jab to keep him resetting at long range rather than mid-range.",
];

// Plans B and C weren't open in the screenshots; add their points here when available.
const OP_PLANS: { title: string; sub: string; items: string[] }[] = [
  { title: "Game Plan A", sub: "Primary strategy", items: PLAN_A },
  { title: "Game Plan B", sub: "If Plan A isn't working", items: [] },
  { title: "Game Plan C", sub: "Deep / late rounds", items: [] },
];

const OP_COUNTERS = [
  { title: "vs His Straight Right", text: "Slip to the inside and counter with a stiff left hook over his low left shoulder." },
  { title: "vs His Rope Pressure", text: "Use a tight frame, pivot sharply to the weak side, and exit toward center ring." },
];

const OP_OPENINGS = [
  "Exposes his chin along the centerline when overcommitting to straight right hands.",
  "Leaves a gap on his right side when ducking forward into exchanges.",
  "Vulnerable to check hooks when rushing forward linearly.",
];

const OP_DRILLS = [
  {
    title: "Check Hook & Pivot Drill",
    level: "Intermediate",
    duration: "4 × 3 min",
    equipment: "Focus mitts",
    text: "Teaches timing the check hook and pivoting off when an aggressive fighter charges in.",
  },
  {
    title: "Rope Escape & Lateral Movement",
    level: "Intermediate",
    duration: "3 × 3 min",
    equipment: "Ring / Sparring partner",
    text: "Drills escaping ring corners without getting trapped along the ropes.",
  },
];

const OP_MISTAKES = [
  "Backing up in straight lines to the ropes where he thrives.",
  "Staying stationary in the pocket during his multi-punch flurries.",
  "Attempting to out-muscle him in tight quarters without tying him up.",
];

const OP_FUTURE = [
  "Punch Count",
  "Punch Accuracy",
  "Punch Speed",
  "Reaction Time",
  "Power Estimate",
  "Ring Control",
  "Pressure Rating",
  "Damage Taken Estimate",
  "Punch Heatmaps",
  "Auto Clip Bookmarks",
  "Auto Highlight Reel",
];

export function OpponentReport() {
  const [openPlan, setOpenPlan] = useState(0);

  return (
    <ReportFrame>
      <p className={`${LABEL} flex items-center gap-2 ${PURPLE}`}>
        <Icon name="sparkles" size={16} />
        Analysis Complete
      </p>
      <h1 className="fiq-d mt-3 text-[2.3rem] font-bold leading-[1.05]">Opponent Intelligence Report</h1>
      <p className="mt-2 text-[17px] text-white/55">Complete Tactical Breakdown</p>

      <div className={`${CARD} mt-8 overflow-hidden`}>
        <div className="flex items-center gap-4 p-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#7c3aed] to-[#5b21b6] shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <Icon name="skull" size={26} />
          </div>
          <div>
            <p className="text-xl font-medium">orange shorts</p>
            <p className="fiq-m mt-1 text-xs tracking-[0.2em] text-white/50">09/10/2026</p>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/[0.08]">
          <div className="py-5 text-center">
            <p className="fiq-d text-2xl font-bold">Orthodox</p>
            <p className={`${LABEL} mt-1 text-white/45`}>Stance</p>
          </div>
          <div className="border-l border-white/[0.08] py-5 text-center">
            <p className={`fiq-d text-2xl font-bold ${PURPLE}`}>85%</p>
            <p className={`${LABEL} mt-1 text-white/45`}>Confidence</p>
          </div>
        </div>
      </div>

      <SectionLabel n="01" label="Executive" title="Executive Summary" />
      <div className={`${CARD} p-5`}>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a090e] p-4">
          <p className={`${LABEL} text-white/45`}>Style</p>
          <p className="mt-1 text-[17px]">Aggressive pressure puncher</p>
        </div>
        <p className="mt-5 text-[15px] leading-relaxed text-white/55">{OP_SUMMARY}</p>
      </div>

      <SectionLabel n="02" label="Tactics" title="Tactical Breakdown" />
      <Bars items={OP_TACTICS} />

      <SectionLabel n="03" label="Threats" title="Strengths" sub="What makes him dangerous." />
      <div className="space-y-3">
        {OP_STRENGTHS.map((s) => (
          <div key={s.title} className={`${CARD} p-5`}>
            <div className="flex items-center gap-3">
              <Icon name="shieldAlert" size={20} className={`shrink-0 ${PURPLE}`} />
              <h3 className="text-[17px] font-medium">{s.title}</h3>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-white/55">{s.text}</p>
          </div>
        ))}
      </div>

      <SectionLabel n="04" label="Openings" title="Weaknesses" sub="How to exploit them." />
      <RowCards items={OP_WEAKNESSES} icon="alert" border="border-[#7c3aed]/20" />

      <SectionLabel n="05" label="Patterns" title="Recurring Habits" />
      <RowCards items={OP_HABITS} icon="dot" />

      <SectionLabel n="06" label="Library" title="Combination Library" />
      <RowCards items={OP_COMBOS} icon="zap" />

      <SectionLabel n="07" label="Defense" title="Defensive Habits" />
      <div className="grid grid-cols-2 gap-3">
        {OP_DEFENSE.map((d) => (
          <div key={d} className="rounded-[1.5rem] border border-white/[0.08] bg-[#0f0e14] p-4">
            <Icon name="shieldCheck" size={18} className="text-white/50" />
            <p className="mt-2 text-sm leading-relaxed text-white/90">{d}</p>
          </div>
        ))}
      </div>

      <SectionLabel n="08" label="Offense" title="Offensive Habits" />
      <RowCards items={OP_OFFENSE} icon="zap" />

      <SectionLabel n="09" label="Range" title="Distance Preferences" />
      <Bars items={OP_RANGE} />

      <SectionLabel n="10" label="Playbook" title="Recommended Combos" sub="Built to exploit this opponent." />
      <div className="space-y-3">
        {OP_PLAYBOOK.map((c) => (
          <div key={c.title} className={`${CARD} p-5`}>
            <h3 className="text-[17px] font-medium">{c.title}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.steps.map((s, i) => (
                <span key={s} className="fiq-m rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80">
                  {`${i + 1}. ${s}`}
                </span>
              ))}
            </div>
            <div className={`${INNER} mt-4 p-4`}>
              <p className={`${LABEL} text-white/45`}>Best Situation</p>
              <p className="mt-1 text-[15px]">{c.when}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-[#7c3aed]/40 bg-[#7c3aed]/[0.06] p-4">
              <p className={`${LABEL} ${PURPLE}`}>Expected Result</p>
              <p className="mt-1 text-[15px]">{c.result}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionLabel n="11" label="Mission" title="Fight Plan" sub="Staged tactical approach." />
      <div className="space-y-3">
        {OP_PLANS.map((p, i) => {
          const isOpen = openPlan === i && p.items.length > 0;
          return (
            <div key={p.title} className={`${CARD} overflow-hidden`}>
              <button
                type="button"
                onClick={() => p.items.length > 0 && setOpenPlan(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#7c3aed] to-[#5b21b6] font-semibold">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-[17px] font-medium">{p.title}</span>
                  <span className="block text-[15px] text-white/50">{p.sub}</span>
                </span>
                <Icon name={isOpen ? "chevronUp" : "chevronDown"} size={18} className="text-white/60" />
              </button>
              {isOpen && (
                <div className="space-y-3 px-5 pb-5">
                  {p.items.map((it) => (
                    <div key={it} className={`${INNER} flex items-start gap-3 p-4`}>
                      <Icon name="target" size={16} className={`mt-0.5 shrink-0 ${PURPLE}`} />
                      <p className="text-[15px] leading-relaxed">{it}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionLabel n="12" label="Counters" title="Counter Strategy" />
      <div className="space-y-3">
        {OP_COUNTERS.map((c) => (
          <div key={c.title} className={`${CARD} p-5`}>
            <div className="flex items-center gap-3">
              <IconBadge name="hand" />
              <h3 className="text-[17px] font-medium">{c.title}</h3>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">{c.text}</p>
          </div>
        ))}
      </div>

      <SectionLabel n="13" label="Windows" title="Openings" />
      <RowCards items={OP_OPENINGS} icon="crosshair" />

      <SectionLabel n="14" label="Training" title="Recommended Drills" sub="Prescribed for this fight." />
      <div className="space-y-3">
        {OP_DRILLS.map((d) => (
          <div key={d.title} className={`${CARD} p-5`}>
            <div className="flex items-start gap-3">
              <IconBadge name="dumbbell" />
              <h3 className="flex-1 pt-2 text-[17px] font-medium leading-snug">{d.title}</h3>
              <span className="fiq-m mt-1.5 shrink-0 rounded-full border border-[#7c3aed]/50 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8b5cf6]">
                {d.level}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`${INNER} p-3`}>
                <p className={`${LABEL} text-white/45`}>Duration</p>
                <p className="mt-1 text-[15px]">{d.duration}</p>
              </div>
              <div className={`${INNER} p-3`}>
                <p className={`${LABEL} text-white/45`}>Equipment</p>
                <p className="mt-1 text-[15px]">{d.equipment}</p>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-white/55">{d.text}</p>
          </div>
        ))}
      </div>

      <SectionLabel n="15" label="Victory" title="Win Conditions" />
      <div className="rounded-[1.75rem] border border-[#7c3aed]/20 bg-[#0f0e14] p-5">
        <div className="flex items-center gap-3">
          <Icon name="trophy" size={20} className={PURPLE} />
          <h3 className="text-[17px] font-medium">Must Happen</h3>
        </div>
        <div className="mt-4 space-y-3">
          {PLAN_A.map((it) => (
            <div key={it} className="flex items-start gap-3">
              <Icon name="target" size={16} className={`mt-0.5 shrink-0 ${PURPLE}`} />
              <p className="text-[15px] leading-relaxed">{it}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionLabel n="16" label="Warnings" title="Biggest Mistakes To Avoid" />
      <RowCards items={OP_MISTAKES} icon="alert" iconClass="text-[#facc15]" border="border-[#facc15]/20" />

      <SectionLabel n="17" label="Signal" title="AI Confidence" />
      <div className={`${CARD} flex items-center gap-5 p-5`}>
        <Ring value={85} size={112}>
          <span className="fiq-d text-3xl font-bold leading-none">85</span>
          <span className="fiq-m mt-1 text-[10px] tracking-[0.25em] text-white/50">OVERALL</span>
        </Ring>
        <p className="text-sm leading-relaxed text-white/55">
          Confidence reflects how much the footage allowed a reliable read. Longer, clearer footage of this opponent improves every metric.
        </p>
      </div>

      <SectionLabel n="18" label="Roadmap" title="Future Metrics" />
      <div className="grid grid-cols-2 gap-3">
        {OP_FUTURE.map((f) => (
          <div key={f} className="rounded-[1.5rem] border border-white/[0.08] bg-[#0f0e14] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[15px] leading-snug text-white/75">{f}</p>
              <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-white/50" />
            </div>
            <p className={`${LABEL} mt-2 text-[10px] text-[#7c3aed]`}>Coming Soon</p>
          </div>
        ))}
      </div>

      <AppButtons primary="Watch Footage" />
      <p className={`${LABEL} mt-6 flex items-center justify-center gap-2 text-[10px] text-white/50`}>
        <Icon name="sparkles" size={14} className={PURPLE} />
        End of Report · Fight IQ Intelligence
      </p>
    </ReportFrame>
  );
}
