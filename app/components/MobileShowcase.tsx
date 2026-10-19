import Image from "next/image";

const features = [
  {
    kicker: "Sparring analysis",
    title: "See the patterns you can't feel mid-round.",
    text: "Strengths, recurring habits and drills pulled from your own footage.",
    screen: "/screens/sparring-upload.png",
    alt: "Fight IQ sparring upload screen",
  },
  {
    kicker: "Opponent scanner",
    title: "Scout your next opponent.",
    text: "Tendencies, openings and a game plan to train against.",
    screen: "/screens/scanner.png",
    alt: "Fight IQ opponent scanner screen",
  },
  {
    kicker: "Training score",
    title: "Show up, log it, watch it add up.",
    text: "A score and streaks that reward consistency, plus team leaderboards.",
    screen: "/screens/profile.png",
    alt: "Fight IQ profile screen",
  },
];

const included = [
  "AI sparring analysis",
  "Opponent scouting reports",
  "Invisible Training Score",
  "Training log with streaks",
  "Team leaderboards",
];

function ScreenFrame({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative isolate mx-auto mt-10 w-[72%] max-w-[300px]">
      <div className="absolute -inset-x-12 -inset-y-8 -z-10 bg-[radial-gradient(closest-side,rgba(139,31,224,0.35),transparent)]" />
      <div className="rounded-[2.2rem] border-[6px] border-[#1c1b22] bg-black shadow-[0_30px_80px_-30px_rgba(139,31,224,0.5)]">
        <div className="relative aspect-[1242/2688] overflow-hidden rounded-[1.75rem]">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 767px) 72vw, 300px"
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}

export default function MobileShowcase() {
  return (
    <div>
      <section className="px-6 pb-16 pt-28 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">
          AI boxing analysis
        </p>
        <h1 className="mx-auto mt-4 max-w-sm text-4xl font-semibold leading-[1.05] tracking-tight">
          Your sparring, watched like a coach saw every second.
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-base text-muted">
          Upload your footage. Get a breakdown of your habits, openings and
          drills in minutes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#notify"
            className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition active:bg-accent-glow"
          >
            Get notified
          </a>
          <p className="text-xs text-muted">Coming soon to iPhone</p>
        </div>
        <ScreenFrame
          src="/screens/dashboard.png"
          alt="Fight IQ dashboard screen"
          priority
        />
      </section>

      {features.map((f) => (
        <section key={f.kicker} className="px-6 py-14 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-accent-glow">
            {f.kicker}
          </p>
          <h2 className="mx-auto mt-3 max-w-xs text-2xl font-semibold leading-[1.1] tracking-tight">
            {f.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xs text-sm text-muted">{f.text}</p>
          <ScreenFrame src={f.screen} alt={f.alt} />
        </section>
      ))}

      <section className="px-6 py-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Everything in one app
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {included.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
