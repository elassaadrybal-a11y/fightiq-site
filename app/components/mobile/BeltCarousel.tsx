import { useId } from "react";

type Belt = {
  name: string;
  metal: [string, string, string]; // light, mid, dark
  gem: [string, string]; // light, dark
  strap: [string, string]; // top, bottom
  glow: string;
};

const BELTS: Belt[] = [
  { name: "Diamond Belt", metal: ["#ffffff", "#cfd8e3", "#6b7785"], gem: ["#e0f7ff", "#5ccff5"], strap: ["#1f2937", "#090c12"], glow: "#7dd3fc" },
  { name: "Gold Belt", metal: ["#fff6c2", "#f5c542", "#9a6a08"], gem: ["#fecaca", "#b91c1c"], strap: ["#1c1917", "#080706"], glow: "#facc15" },
  { name: "Amethyst Belt", metal: ["#f5ebff", "#c084fc", "#5b1a91"], gem: ["#f3e8ff", "#7e22ce"], strap: ["#2e1065", "#10031f"], glow: "#a855f7" },
  { name: "Emerald Belt", metal: ["#fff6c2", "#e8b931", "#7f5306"], gem: ["#d1fae5", "#047857"], strap: ["#064e3b", "#011a14"], glow: "#10b981" },
  { name: "Ruby Belt", metal: ["#ffffff", "#e2e8f0", "#7c8798"], gem: ["#ffe4e6", "#be123c"], strap: ["#4c0519", "#1a0208"], glow: "#f43f5e" },
  { name: "Sapphire Belt", metal: ["#f0f9ff", "#93c5fd", "#1e3a8a"], gem: ["#dbeafe", "#1d4ed8"], strap: ["#172554", "#070c26"], glow: "#3b82f6" },
  { name: "Rose Gold Belt", metal: ["#fff1f2", "#f4a5ae", "#a3525d"], gem: ["#ffffff", "#fb7185"], strap: ["#3f1d24", "#14070a"], glow: "#fb7185" },
  { name: "Topaz Belt", metal: ["#fff8d6", "#fbbf24", "#a54a06"], gem: ["#fef3c7", "#ea580c"], strap: ["#431407", "#160501"], glow: "#f97316" },
  { name: "Platinum Belt", metal: ["#ffffff", "#d4d4d8", "#63636b"], gem: ["#eef2ff", "#6366f1"], strap: ["#18181b", "#050506"], glow: "#a5b4fc" },
  { name: "Obsidian Belt", metal: ["#b4b4bd", "#3f3f46", "#050507"], gem: ["#ede9fe", "#5b21b6"], strap: ["#0b0b0f", "#000000"], glow: "#8b5cf6" },
  { name: "Aquamarine Belt", metal: ["#ffffff", "#ccfbf1", "#4b8d86"], gem: ["#ccfbf1", "#0d9488"], strap: ["#042f2e", "#010f0e"], glow: "#2dd4bf" },
  { name: "Black Gold Belt", metal: ["#fff3b0", "#d4a017", "#5c3d00"], gem: ["#f5f5f5", "#18181b"], strap: ["#0a0a0a", "#000000"], glow: "#eab308" },
];

const PLATE = "M120 18 L160 32 L172 80 L160 128 L120 142 L80 128 L68 80 L80 32 Z";
const PLATE_INNER = "M120 28 L153 40 L163 80 L153 120 L120 132 L87 120 L77 80 L87 40 Z";
const STAR = "M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z";
const SPARKLES: [number, number, number][] = [
  [86, 30, 0],
  [170, 46, 0.7],
  [62, 118, 1.4],
];
const STUDS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { x: 120 + Math.cos(a) * 40, y: 80 + Math.sin(a) * 46 };
});

function BeltArt({ belt, delay }: { belt: Belt; delay: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `${n}${uid}`;
  const url = (n: string) => `url(#${id(n)})`;
  const [mLight, mMid, mDark] = belt.metal;

  return (
    <svg viewBox="0 0 240 160" className="h-auto w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id("metal")} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={mLight} />
          <stop offset="0.35" stopColor={mMid} />
          <stop offset="0.5" stopColor={mLight} />
          <stop offset="0.75" stopColor={mDark} />
          <stop offset="1" stopColor={mMid} />
        </linearGradient>
        <linearGradient id={id("strap")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={belt.strap[0]} />
          <stop offset="1" stopColor={belt.strap[1]} />
        </linearGradient>
        <radialGradient id={id("gem")} cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.25" stopColor={belt.gem[0]} />
          <stop offset="1" stopColor={belt.gem[1]} />
        </radialGradient>
        <linearGradient id={id("shine")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id("clip")}>
          <path d={PLATE} />
        </clipPath>
      </defs>

      {/* Strap with stitching */}
      <path d="M6 62 Q120 46 234 62 L234 98 Q120 114 6 98 Z" fill={url("strap")} />
      <path d="M6 62 Q120 46 234 62" fill="none" stroke={mMid} strokeOpacity="0.7" strokeWidth="2" />
      <path d="M6 98 Q120 114 234 98" fill="none" stroke={mMid} strokeOpacity="0.7" strokeWidth="2" />
      <path d="M10 68 Q120 53 230 68" fill="none" stroke={mLight} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 4" />
      <path d="M10 92 Q120 107 230 92" fill="none" stroke={mLight} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 4" />

      {/* Side plates */}
      {[34, 178].map((x) => (
        <g key={x}>
          <rect x={x} y={60} width={28} height={40} rx={6} fill={url("metal")} stroke={mDark} strokeWidth="1.5" />
          <rect x={x + 4} y={64} width={20} height={32} rx={4} fill="none" stroke={mLight} strokeOpacity="0.6" />
          <circle cx={x + 14} cy={80} r={5} fill={url("gem")} />
        </g>
      ))}
      {[18, 222].map((x) => (
        <circle key={x} cx={x} cy={80} r={3} fill={url("metal")} />
      ))}

      {/* Centre plate */}
      <path d={PLATE} fill={url("metal")} stroke={mDark} strokeWidth="2" strokeLinejoin="round" />
      <path d={PLATE_INNER} fill="none" stroke={mLight} strokeOpacity="0.7" strokeWidth="1.5" strokeLinejoin="round" />
      {STUDS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={2.6} fill={i % 2 ? url("gem") : mLight} />
      ))}

      {/* Faceted centre gem */}
      <path d="M106 58 L134 58 L146 76 L120 108 L94 76 Z" fill={url("gem")} stroke={mDark} strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M94 76 L146 76 M106 58 L113 76 L120 108 L127 76 L134 58 M113 76 L120 58 L127 76"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      <path d="M108 61 L118 61 L112 72 Z" fill="#ffffff" fillOpacity="0.75" />

      {/* Shine sweeping across the plate */}
      <g clipPath={url("clip")}>
        <rect x="-60" y="0" width="36" height="160" fill={url("shine")} transform="skewX(-18)">
          <animate attributeName="x" values="-60;260" dur="3.2s" begin={`${delay}s`} repeatCount="indefinite" />
        </rect>
      </g>

      {/* Sparkles */}
      {SPARKLES.map(([x, y, d]) => (
        <path key={`${x}-${y}`} d={STAR} transform={`translate(${x} ${y})`} fill="#ffffff" opacity="0">
          <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin={`${delay + d}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );
}

function BeltCard({ belt, delay }: { belt: Belt; delay: number }) {
  return (
    <div className="shrink-0 pr-4">
      <div
        className="relative flex aspect-[4/5] w-[68vw] max-w-[300px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-[#07070c]"
        style={{ backgroundImage: `radial-gradient(circle at 50% 45%, ${belt.glow}40 0%, transparent 65%)` }}
      >
        <div className="w-[92%]" style={{ filter: `drop-shadow(0 0 18px ${belt.glow}99)` }}>
          <BeltArt belt={belt} delay={delay} />
        </div>
        <span className="absolute bottom-8 text-lg text-white/85">{belt.name}</span>
      </div>
    </div>
  );
}

function BeltRow({ belts, duration, reverse = false }: { belts: Belt[]; duration: number; reverse?: boolean }) {
  // Two copies side by side, so the loop is seamless
  const items = [...belts, ...belts];
  return (
    <div className="pointer-events-none overflow-hidden">
      <div
        className="fiq-marquee flex w-max"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {items.map((b, i) => (
          <BeltCard key={`${b.name}-${i}`} belt={b} delay={(i % belts.length) * 0.45} />
        ))}
      </div>
    </div>
  );
}

export default function BeltCarousel() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <style>
        {
          "@keyframes fiqMarquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}.fiq-marquee{animation-name:fiqMarquee;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}@media (prefers-reduced-motion: reduce){.fiq-marquee{animation-play-state:paused}}"
        }
      </style>
      <BeltRow belts={BELTS.slice(0, 6)} duration={45} />
      <BeltRow belts={BELTS.slice(6)} duration={50} reverse />
    </div>
  );
}
