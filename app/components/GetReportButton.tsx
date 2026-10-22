"use client";

import { useState } from "react";

export default function GetReportButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  const go = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
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
      <button
        type="button"
        onClick={go}
        disabled={state === "loading"}
        className="flex h-14 w-full items-center justify-center rounded-full bg-white text-lg font-semibold text-black shadow-[0_0_40px_rgba(168,85,247,0.35)] transition disabled:opacity-60"
      >
        {state === "loading" ? "Opening checkout..." : "Get your report"}
      </button>
      {state === "error" && <p className="mt-3 text-sm text-red-300">{"Checkout couldn't open. Try again in a moment."}</p>}
    </>
  );
}
