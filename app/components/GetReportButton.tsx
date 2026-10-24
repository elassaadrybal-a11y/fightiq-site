"use client";

import { useState } from "react";

export default function GetReportButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [agreed, setAgreed] = useState(false);

  const go = async () => {
    if (!agreed) return;
    setState("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, agreed: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <label className="mb-5 flex items-start gap-3 text-left text-sm leading-relaxed text-white/65">
        <input
          type="checkbox"
          checked={agreed}
          disabled={state === "loading"}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#a855f7]"
        />
        <span>
          I agree to the{" "}
          <a href="/terms" target="_blank" className="text-white underline underline-offset-2">
            Terms
          </a>{" "}
          and{" "}
          <a href="/refunds" target="_blank" className="text-white underline underline-offset-2">
            Refund Policy
          </a>
          . I ask for my analysis to start straight after payment, and I understand I lose my right of withdrawal once it has started.
        </span>
      </label>
      <button
        type="button"
        onClick={go}
        disabled={state === "loading" || !agreed}
        className="flex h-14 w-full items-center justify-center rounded-full bg-white text-lg font-semibold text-black shadow-[0_0_40px_rgba(168,85,247,0.35)] transition disabled:opacity-50"
      >
        {state === "loading" ? "Opening checkout..." : "Get your report"}
      </button>
      {state === "error" && <p className="mt-3 text-sm text-red-300">{"Checkout couldn't open. Try again in a moment."}</p>}
    </>
  );
}
