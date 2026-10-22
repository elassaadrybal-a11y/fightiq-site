import { NextResponse } from "next/server";
import { db } from "../../../lib/firebaseAdmin";
import { isOrderId, publicOrder } from "../../../lib/orders";

// The order page polls this while the analysis runs
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isOrderId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const snap = await db().collection("web_orders").doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(publicOrder(id, snap.data() ?? {}), { headers: { "Cache-Control": "no-store" } });
}
