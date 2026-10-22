"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OpponentReport, SparringReport, toOpponentData, toSparringData, type ReportAction } from "../../products/Reports";
import GetReportButton from "../../components/GetReportButton";
import type { PublicOrder } from "../../lib/orders";
import { site } from "../../site";

const LABELS: Record<string, string> = { sparring: "Sparring Analysis", opponent: "Opponent Scanner" };

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/60">
      {children}
    </span>
  );
}

// Printing: hide the site header and buttons, keep the dark colours, no page margins
const PRINT_CSS =
  "@media print{@page{margin:0}html,body,main{background:#060509!important}header,.fiq-noprint{display:none!important}main{padding:0!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}";

function FullReport({ order }: { order: PublicOrder }) {
  const [shareLabel, setShareLabel] = useState("Share Report");
  const isOpponent = order.product === "opponent";
  const title = isOpponent ? "Fight IQ - Opponent Intelligence Report" : "Fight IQ - Sparring Analysis";

  const download = () => {
    // The browser's print window has "Save as PDF"; the title becomes the file name
    const previous = document.title;
    document.title = title;
    window.print();
    document.title = previous;
  };

  const share = async () => {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied");
      setTimeout(() => setShareLabel("Share Report"), 2500);
    } catch {
      // closed the share sheet, nothing to do
    }
  };

  const actions: ReportAction[] = [
    { label: "Download PDF", icon: "download", onClick: download },
    { label: shareLabel, icon: "share", onClick: share },
    { label: "Back To Fight IQ", icon: "home", href: "/" },
  ];

  return (
    <div className="-mx-6 sm:mx-0">
      <style>{PRINT_CSS}</style>
      <p className="fiq-noprint mb-5 px-6 text-center text-sm leading-relaxed text-white/45 sm:px-0">
        Your report stays at this link. Bookmark it to come back any time.
      </p>
      {isOpponent ? (
        <OpponentReport data={toOpponentData(order.report, order.personDescription, order.completedAt)} actions={actions} edge />
      ) : (
        <SparringReport data={toSparringData(order.analysis, order.completedAt)} actions={actions} edge />
      )}
    </div>
  );
}

export default function OrderView({ initial }: { initial: PublicOrder }) {
  const [order, setOrder] = useState(initial);
  const label = LABELS[order.product] ?? "report";
  const working = order.status === "queued" || order.status === "processing";

  // While the analysis runs, check for updates every few seconds
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.id}`, { cache: "no-store" });
        if (res.ok) setOrder(await res.json());
      } catch {
        // try again on the next tick
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [working, order.id]);

  if (order.status === "awaiting_upload") {
    return (
      <div className="text-center">
        <Chip>{label}</Chip>
        <h1 className="mt-6 text-[clamp(2.2rem,10vw,3.2rem)] font-bold leading-tight tracking-tight">{"The upload didn't finish"}</h1>
        <p className="mt-4 text-lg text-white/70">Start again and keep the page open until the upload reaches 100%.</p>
        <Link href={`/analyze/${order.product}`} className="mt-8 inline-flex h-14 items-center rounded-full bg-white px-8 text-lg font-semibold text-black">
          Upload again
        </Link>
      </div>
    );
  }

  if (order.status === "uploaded") {
    return (
      <div className="text-center">
        <Chip>Footage uploaded</Chip>
        <h1 className="mt-6 text-[clamp(2.4rem,11vw,3.5rem)] font-bold leading-[1.02] tracking-tight">Ready to analyse.</h1>
        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-white/70">
          {`Your clip is in. Get your ${label} and the analysis starts straight after payment.`}
        </p>
        <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#0a0810] p-6">
          <GetReportButton orderId={order.id} />
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            {"If you don't continue, the footage is deleted automatically within 24 hours."}
          </p>
        </div>
      </div>
    );
  }

  if (working) {
    const pct = Math.max(5, Math.min(100, order.progress || 5));
    return (
      <div className="text-center">
        <Chip>Payment confirmed</Chip>
        <h1 className="mt-6 text-[clamp(2.4rem,11vw,3.5rem)] font-bold leading-[1.02] tracking-tight">Analysing your footage.</h1>
        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-white/70">
          This usually takes a few minutes. You can keep this page open or come back to this link later.
        </p>
        <div className="mt-10 rounded-[2rem] border border-white/10 bg-[#0a0810] p-6 text-left">
          <div className="flex justify-between text-sm text-white/70">
            <span>{label}</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#a855f7] transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (order.status === "complete") return <FullReport order={order} />;

  return (
    <div className="text-center">
      <h1 className="text-[clamp(2.2rem,10vw,3.2rem)] font-bold leading-tight tracking-tight">Something went wrong</h1>
      <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-white/70">
        {"We couldn't finish this analysis. Email us with this page's link and we'll sort it out or refund you."}
      </p>
      <a
        href={`mailto:${site.contactEmail}?subject=Order%20${order.id}`}
        className="mt-8 inline-flex h-14 items-center rounded-full bg-white px-8 text-lg font-semibold text-black"
      >
        Email us
      </a>
    </div>
  );
}
