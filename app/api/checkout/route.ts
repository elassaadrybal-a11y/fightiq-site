import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../lib/firebaseAdmin";
import { isOrderId } from "../../lib/orders";
import { getStripe } from "../../lib/stripe";

// Change when the Terms or Refund Policy change, to know which version each customer accepted
const TERMS_VERSION = "2026-10-25";

const PRICES: Record<string, string | undefined> = {
  sparring: process.env.STRIPE_PRICE_SPARRING,
  opponent: process.env.STRIPE_PRICE_OPPONENT,
};

// Opens Stripe checkout for an order whose footage is already uploaded
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "Checkout is not open yet." }, { status: 403 });
  }

  let orderId = "";
  let agreed = false;
  try {
    const body = await req.json();
    orderId = typeof body?.orderId === "string" ? body.orderId : "";
    agreed = body?.agreed === true;
  } catch {
    // handled below
  }
  if (!isOrderId(orderId)) return NextResponse.json({ error: "Unknown order." }, { status: 400 });
  if (!agreed) {
    return NextResponse.json({ error: "Please accept the Terms and Refund Policy first." }, { status: 400 });
  }

  try {
    const snap = await db().collection("web_orders").doc(orderId).get();
    if (!snap.exists) return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    const order = snap.data() ?? {};
    if (order.status !== "uploaded") {
      return NextResponse.json({ error: "This order isn't ready for payment." }, { status: 409 });
    }
    const price = PRICES[order.product];
    if (!price) return NextResponse.json({ error: "Unknown product." }, { status: 400 });

    // Record that the customer accepted the terms and asked for the analysis to start immediately
    await snap.ref.update({ termsAccepted: true, termsAcceptedAt: FieldValue.serverTimestamp(), termsVersion: TERMS_VERSION });

    const origin = new URL(req.url).origin;
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: orderId,
      metadata: { orderId, product: order.product, terms_version: TERMS_VERSION, immediate_start_requested: "yes" },
      custom_text: {
        submit: { message: "Your analysis starts as soon as payment goes through. You can't withdraw once it has started." },
      },
      success_url: `${origin}/order/${orderId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/${orderId}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout failed", err);
    return NextResponse.json({ error: "Checkout could not be created." }, { status: 500 });
  }
}
