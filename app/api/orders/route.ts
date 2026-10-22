import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../lib/firebaseAdmin";
import { cleanDescription, isProduct } from "../../lib/orders";

// Creates an order so the visitor can upload their footage
export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_CHECKOUT_ENABLED !== "true") {
    return NextResponse.json({ error: "Uploads are not open yet." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // handled below
  }

  if (!isProduct(body.product)) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }
  const personDescription = cleanDescription(body.personDescription);
  if (personDescription.length < 2) {
    const msg = body.product === "opponent" ? "Tell us which fighter to scout." : "Tell us which fighter you are.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const ref = db().collection("web_orders").doc();
    await ref.set({
      product: body.product,
      personDescription,
      status: "awaiting_upload",
      progress: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ orderId: ref.id, uploadPath: `uploads/${ref.id}/video` });
  } catch (err) {
    console.error("Create order failed", err);
    return NextResponse.json({ error: "Could not start the upload. Try again." }, { status: 500 });
  }
}
