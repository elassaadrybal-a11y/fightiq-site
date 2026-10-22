import Link from "next/link";

const ENABLED = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

export default function BuyButton({ product }: { product: "sparring" | "opponent" }) {
  if (!ENABLED) {
    return (
      <span
        aria-disabled="true"
        className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-white/10 text-base font-semibold text-white/50"
      >
        Checkout opens at launch
      </span>
    );
  }
  return (
    <Link
      href={`/analyze/${product}`}
      className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-white text-base font-semibold text-black"
    >
      Upload your footage
    </Link>
  );
}
