import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FieldValue } from "firebase-admin/firestore";
import MobileHeader from "../../components/mobile/MobileHeader";
import { db } from "../../lib/firebaseAdmin";
import { isOrderId, publicOrder } from "../../lib/orders";
import { getStripe } from "../../lib/stripe";
import OrderView from "./OrderView";
import { display, mono, sans } from "../../products/fonts";

export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-[clamp(2.2rem,10vw,3.2rem)] font-bold leading-tight tracking-tight">Order not found</h1>
      <p className="mt-5 text-lg leading-relaxed text-white/70">This link doesn&apos;t match an order.</p>
      <Link href="/products" className="mt-8 inline-flex h-14 items-center rounded-full bg-white px-8 text-lg font-semibold text-black">
        Back to products
      </Link>
    </div>
  );
}

async function OrderContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : "";
  if (!isOrderId(id)) return <NotFound />;

  const ref = db().collection("web_orders").doc(id);
  let snap = await ref.get();
  if (!snap.exists) return <NotFound />;

  // Back from Stripe: confirm the payment and start the analysis
  if (sessionId && snap.data()?.status === "uploaded") {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.metadata?.orderId === id) {
        await db().runTransaction(async (tx) => {
          const current = await tx.get(ref);
          if (current.data()?.status === "uploaded") {
            tx.update(ref, {
              status: "queued",
              paid: true,
              email: session.customer_details?.email ?? "",
              stripeSessionId: session.id,
              paidAt: FieldValue.serverTimestamp(),
            });
          }
        });
        snap = await ref.get();
      }
    } catch (err) {
      console.error("Payment check failed", err);
    }
  }

  return <OrderView initial={publicOrder(id, snap.data() ?? {})} />;
}

export default function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <MobileHeader />
      </Suspense>
      <main className={`${display.variable} ${sans.variable} ${mono.variable} relative min-h-svh bg-black px-6 pb-20 pt-36 text-white`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[60svh]"
          style={{ background: "radial-gradient(120% 70% at 50% 0%, #a855f744 0%, transparent 72%)" }}
        />
        <div className="relative mx-auto max-w-lg">
          <Suspense fallback={<p className="text-center text-lg text-white/60">Loading your order...</p>}>
            <OrderContent params={params} searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
