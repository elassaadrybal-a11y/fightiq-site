import { NextResponse } from "next/server";
import { bucket, db } from "../../../../lib/firebaseAdmin";
import { isOrderId } from "../../../../lib/orders";

// Called by the browser once the upload has finished
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isOrderId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ref = db().collection("web_orders").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (snap.data()?.status !== "awaiting_upload") return NextResponse.json({ ok: true });

  const videoPath = `uploads/${id}/video`;
  const [exists] = await bucket().file(videoPath).exists();
  if (!exists) return NextResponse.json({ error: "The video didn't arrive. Try uploading again." }, { status: 400 });

  await ref.update({ status: "uploaded", videoPath });
  return NextResponse.json({ ok: true });
}
