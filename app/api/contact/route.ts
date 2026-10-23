import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../lib/firebaseAdmin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Saves a contact form message to Firestore (collection: contact_messages)
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // handled below
  }

  // Bots fill the hidden field or submit instantly. Pretend it worked so they move on.
  const elapsed = typeof body.elapsed === "number" ? body.elapsed : 0;
  if ((typeof body.website === "string" && body.website !== "") || elapsed < 1500) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
  const topic = typeof body.topic === "string" ? body.topic.replace(/[^a-z]/g, "").slice(0, 20) : "";

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email so we can reply." }, { status: 400 });
  }
  if (message.length < 2) {
    return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  }

  try {
    await db().collection("contact_messages").add({
      email,
      message,
      topic: topic || "general",
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact message failed", err);
    return NextResponse.json({ error: "Could not send your message. Try again." }, { status: 500 });
  }
}
