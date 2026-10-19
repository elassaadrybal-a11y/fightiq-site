import Image from "next/image";

type Props = { src: string; alt: string; glow: string };

export default function PhoneFrame({ src, alt, glow }: Props) {
  return (
    <div className="relative isolate mx-auto w-[min(66vw,280px)]">
      <div
        aria-hidden="true"
        className="absolute -inset-12 -z-10 rounded-full blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${glow}55, transparent)` }}
      />
      <div className="relative rounded-[3rem] bg-linear-to-b from-neutral-400 via-neutral-700 to-neutral-800 p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
        <span aria-hidden="true" className="absolute -left-[3px] top-[18%] h-[5%] w-[3px] rounded-l bg-neutral-600" />
        <span aria-hidden="true" className="absolute -left-[3px] top-[27%] h-[9%] w-[3px] rounded-l bg-neutral-600" />
        <span aria-hidden="true" className="absolute -left-[3px] top-[38%] h-[9%] w-[3px] rounded-l bg-neutral-600" />
        <span aria-hidden="true" className="absolute -right-[3px] top-[30%] h-[13%] w-[3px] rounded-r bg-neutral-600" />
        <div className="rounded-[2.85rem] bg-black p-[9px]">
          <div className="relative aspect-[1242/2688] overflow-hidden rounded-[2.35rem]">
            <Image src={src} alt={alt} fill sizes="280px" className="object-cover" />
            <div aria-hidden="true" className="absolute left-1/2 top-[1.6%] h-[3.6%] w-[31%] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
