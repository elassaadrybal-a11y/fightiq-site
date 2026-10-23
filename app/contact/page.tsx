import type { Metadata } from "next";
import MobileHeader from "../components/mobile/MobileHeader";
import ContactForm from "./ContactForm";
import { site } from "../site";

export const metadata: Metadata = {
  title: `Contact us | ${site.name}`,
};

export default function ContactPage() {
  return (
    <>
      <MobileHeader />
      <main className="relative min-h-svh overflow-hidden bg-black px-6 pb-20 pt-36 text-white md:pt-44">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
          style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(168,85,247,0.28), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-lg">
          <h1 className="text-center text-[clamp(2.6rem,12vw,3.75rem)] font-bold leading-[1.02] tracking-tight">Contact us</h1>
          <p className="mx-auto mt-4 max-w-sm text-center text-lg leading-relaxed text-white/65">
            {"Questions, feedback or launch updates. Send us a message and we'll get back to you by email."}
          </p>
          <ContactForm />
          <p className="mt-8 text-center text-sm text-white/45">
            Or email us directly at{" "}
            <a href={`mailto:${site.contactEmail}`} className="text-white/75 underline underline-offset-4">
              {site.contactEmail}
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
