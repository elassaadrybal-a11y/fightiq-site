import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MobileHeader from "../../components/mobile/MobileHeader";
import Uploader from "./Uploader";

export const metadata: Metadata = { title: "Upload your footage", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return [{ product: "sparring" }, { product: "opponent" }];
}

async function UploaderForProduct({ params }: { params: Promise<{ product: string }> }) {
  const { product } = await params;
  if (product !== "sparring" && product !== "opponent") notFound();
  return <Uploader product={product} />;
}

export default function AnalyzePage({ params }: { params: Promise<{ product: string }> }) {
  return (
    <>
      <MobileHeader />
      <main className="relative min-h-svh bg-black px-6 pb-20 pt-36 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[60svh]"
          style={{ background: "radial-gradient(120% 70% at 50% 0%, #a855f744 0%, transparent 72%)" }}
        />
        <Suspense fallback={<p className="text-center text-lg text-white/60">Loading...</p>}>
          <UploaderForProduct params={params} />
        </Suspense>
      </main>
    </>
  );
}
