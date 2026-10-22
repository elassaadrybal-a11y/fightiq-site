import type { DocumentData } from "firebase-admin/firestore";

export type Product = "sparring" | "opponent";

export const isProduct = (p: unknown): p is Product => p === "sparring" || p === "opponent";

export const isOrderId = (id: string) => /^[A-Za-z0-9]{10,40}$/.test(id);

// Short, plain description of a fighter, safe to put inside the AI instructions
export function cleanDescription(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.replace(/["\\`\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

export type PublicOrder = {
  id: string;
  product: string;
  status: string;
  progress: number;
  personDescription: string;
  errorMessage: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analysis: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any;
  completedAt: string; // ISO date the analysis finished, "" if not yet
};

// What the browser is allowed to see (no email, no storage path, no timestamps)
export function publicOrder(id: string, d: DocumentData): PublicOrder {
  const strip = (o: unknown) => {
    if (!o || typeof o !== "object") return null;
    const copy = { ...(o as Record<string, unknown>) };
    delete copy.completedAt;
    return copy;
  };
  const finished = (d.analysis ?? d.report)?.completedAt;
  const completedAt =
    finished && typeof finished.toDate === "function" ? (finished.toDate() as Date).toISOString() : "";
  return {
    id,
    product: typeof d.product === "string" ? d.product : "",
    status: typeof d.status === "string" ? d.status : "",
    progress: typeof d.progress === "number" ? d.progress : 0,
    personDescription: typeof d.personDescription === "string" ? d.personDescription : "",
    errorMessage: typeof d.errorMessage === "string" ? d.errorMessage : "",
    analysis: strip(d.analysis),
    report: strip(d.report),
    completedAt,
  };
}
