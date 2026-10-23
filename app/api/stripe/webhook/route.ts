import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../../lib/firebaseAdmin";
import { isOrderId } from "../../../lib/orders";
import { getStripe } from "../../../lib/stripe";

// Stripe calls this after every payment, even if the customer closes the tab
// before getting back to the order page. It starts the analysis for paid orders.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature check failed", err);
    return NextResponse.json({ error: "Bad signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId || session.client_reference_id || "";
    if (session.payment_status === "paid" && isOrderId(orderId)) {
      const ref = db().collection("web_orders").doc(orderId);
      try {
        // Same check as the order page, so an order only ever starts once
        await db().runTransaction(async (tx) => {
          const current = await tx.get(ref);
          if (current.exists && current.data()?.status === "uploaded") {
            tx.update(ref, {
              status: "queued",
              paid: true,
              email: session.customer_details?.email ?? "",
              stripeSessionId: session.id,
              paidAt: FieldValue.serverTimestamp(),
            });
          }
        });
      } catch (err) {
        console.error("Stripe webhook could not update order", orderId, err);
        // A 500 makes Stripe retry later
        return NextResponse.json({ error: "Order update failed." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
