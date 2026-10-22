import Stripe from "stripe";

let client: Stripe | null = null;

// Server only. Created on first use so builds don't need the key.
export function getStripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

export const PRODUCT_LABELS: Record<string, string> = {
  sparring: "Sparring Analysis",
  opponent: "Opponent Scanner",
};
