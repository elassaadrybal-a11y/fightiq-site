import Image from "next/image";

const SCREENS = [
  {
    src: "/screens/dashboard.png",
    label: "Dashboard",
    title: "Your training at a glance",
    text: "Log sessions and see the score for each one, so you know whether the work is adding up.",
  },
  {
    src: "/screens/sparring-upload.png",
    label: "Sparring Analysis",
    title: "Every round, broken down",
    text: "Upload a spar and get a coach-style breakdown of your strengths, habits and mistakes.",
  },
  {
    src: "/screens/scanner.png",
    label: "Opponent Scanner",
    title: "Know them before the bell",
    text: "Upload your next opponent's footage and get a scouting report you can train against.",
  },
  {
    src: "/screens/profile.png",
    label: "Profile",
    title: "Your game, in one place",
    text: "Your history, scores and reports live together, so you can follow your progress.",
  },
];

export default function AppScreens() {
  return (
    <div className="bg-black px-6 pb-20 pt-32 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60svh]"
        style={{ background: "radial-gradient(120% 70% at 50% 0%, #a855f755 0%, #3b076477 38%, transparent 72%)" }}
      />
      <div className="relative text-center">
        <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/60">
          The App
        </span>
        <h1 className="mt-6 text-[clamp(2.8rem,13vw,4rem)] font-bold leading-[0.98] tracking-tight">
          Inside
          <br />
          Fight IQ.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-lg leading-relaxed text-white/70">A look at the main screens of the app.</p>
      </div>

      <div className="relative mt-16 space-y-24">
        {SCREENS.map((s) => (
          <div key={s.src} className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c084fc]">{s.label}</p>
            <h2 className="mt-3 text-[clamp(2rem,9vw,2.6rem)] font-semibold leading-tight tracking-tight">{s.title}</h2>
            <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-white/65">{s.text}</p>
            <div className="relative mx-auto mt-10 w-[min(70vw,300px)]">
              <div
                aria-hidden="true"
                className="absolute -inset-10 rounded-full blur-3xl"
                style={{ background: "radial-gradient(closest-side, #a855f74d, transparent)" }}
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15">
                <Image src={s.src} alt={`${s.label} screen`} width={1242} height={2688} sizes="300px" className="h-auto w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
