import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../../lib/firebaseAdmin";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPIC_LABEL: Record<string, string> = {
  launch: "Launch notification",
  order: "Order help",
  general: "Message",
};

// Emails the message to CONTACT_INBOX through Resend. Hitting Reply answers the visitor.
async function notify(email: string, message: string, topic: string, id: string) {
  const key = process.env.RESEND_API_KEY;
  const inbox = process.env.CONTACT_INBOX;
  if (!key || !inbox) {
    console.warn("Contact email not sent: RESEND_API_KEY or CONTACT_INBOX is not set");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact-${id}`,
    },
    body: JSON.stringify({
      // onboarding@resend.dev works without a domain, but only sends to your own Resend login email
      from: process.env.CONTACT_FROM || "Fight IQ <onboarding@resend.dev>",
      to: [inbox],
      reply_to: email,
      subject: `${TOPIC_LABEL[topic] ?? "Message"} from ${email}`,
      text: `${message}\n\n---\nFrom: ${email}\nTopic: ${topic}\nSent from the Fight IQ contact form`,
    }),
  });
  if (!res.ok) {
    console.error("Contact email failed", res.status, await res.text().catch(() => ""));
  }
}

// Saves a contact form message to Firestore (collection: contact_messages) and emails it to you
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
  const topic = (typeof body.topic === "string" ? body.topic.replace(/[^a-z]/g, "").slice(0, 20) : "") || "general";

  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Enter a valid email so we can reply." }, { status: 400 });
  }
  if (message.length < 2) {
    return NextResponse.json({ error: "Write a message first." }, { status: 400 });
  }

  try {
    const ref = await db().collection("contact_messages").add({
      email,
      message,
      topic,
      status: "new",
      createdAt: FieldValue.serverTimestamp(),
    });
    // The message is already saved, so an email problem never fails the form
    try {
      await notify(email, message, topic, ref.id);
    } catch (err) {
      console.error("Contact email failed", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact message failed", err);
    return NextResponse.json({ error: "Could not send your message. Try again." }, { status: 500 });
  }
}
