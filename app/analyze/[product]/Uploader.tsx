"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ref, uploadBytesResumable } from "firebase/storage";
import { getClientStorage } from "../../lib/firebaseClient";

const MAX_BYTES = 500 * 1024 * 1024;

const COPY = {
  sparring: {
    label: "Sparring Analysis",
    title: "Upload your sparring",
    question: "Which fighter are you?",
    placeholder: "e.g. red gloves, black shorts",
  },
  opponent: {
    label: "Opponent Scanner",
    title: "Upload your opponent",
    question: "Which fighter should we scout?",
    placeholder: "e.g. orange shorts",
  },
};

export default function Uploader({ product }: { product: "sparring" | "opponent" }) {
  const router = useRouter();
  const copy = COPY[product];
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState("");
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");

  const canStart = !!file && consent && desc.trim().length >= 2 && !uploading;

  const start = async () => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("That video is over 500 MB. Trim it to the rounds you want analysed and try again.");
      return;
    }
    setError("");
    setUploading(true);
    setPct(0);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, personDescription: desc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the upload.");

      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(getClientStorage(), data.uploadPath), file, {
          contentType: file.type && file.type.startsWith("video/") ? file.type : "video/mp4",
        });
        task.on(
          "state_changed",
          (s) => setPct(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          reject,
          () => resolve(),
        );
      });

      const done = await fetch(`/api/orders/${data.orderId}/uploaded`, { method: "POST" });
      if (!done.ok) {
        const info = await done.json().catch(() => ({}));
        throw new Error(info.error || "The upload finished but couldn't be confirmed.");
      }
      router.push(`/order/${data.orderId}`);
    } catch (e) {
      setUploading(false);
      setError(e instanceof Error && e.message ? e.message : "The upload failed. Check your connection and try again.");
    }
  };

  return (
    <div className="relative mx-auto max-w-lg">
      <div className="text-center">
        <span className="inline-block rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-sm font-semibold text-white/60">
          {copy.label}
        </span>
        <h1 className="mt-6 text-[clamp(2.4rem,11vw,3.5rem)] font-bold leading-[1.02] tracking-tight">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-white/70">
          {"Upload first, pay only when you're happy to get the report."}
        </p>
      </div>

      <div className="mt-10 space-y-5 rounded-[2rem] border border-white/10 bg-[#0a0810] p-6">
        <label
          className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition ${
            file ? "border-[#a855f7]/60 bg-[#a855f7]/[0.06]" : "border-white/20 hover:border-white/40"
          }`}
        >
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              setError("");
              setFile(e.target.files?.[0] ?? null);
            }}
          />
          {file ? (
            <>
              <span className="text-base font-semibold">{file.name}</span>
              <span className="mt-1 text-sm text-white/50">{`${(file.size / (1024 * 1024)).toFixed(0)} MB · tap to change`}</span>
            </>
          ) : (
            <>
              <span className="text-base font-semibold">Choose a video</span>
              <span className="mt-1 text-sm text-white/50">A few rounds is plenty. Up to 500 MB.</span>
            </>
          )}
        </label>

        <div>
          <label htmlFor="desc" className="text-sm font-semibold text-white/80">
            {copy.question}
          </label>
          <input
            id="desc"
            type="text"
            maxLength={100}
            value={desc}
            disabled={uploading}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={copy.placeholder}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-white/35 focus:border-[#a855f7]/60 focus:outline-none"
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-relaxed text-white/65">
          <input
            type="checkbox"
            checked={consent}
            disabled={uploading}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#a855f7]"
          />
          <span>
            I have permission from the people in this video to upload it. The footage is deleted once the report is made, or after 24 hours if
            no report is bought.
          </span>
        </label>

        {uploading ? (
          <div>
            <div className="flex justify-between text-sm text-white/70">
              <span>Uploading</span>
              <span>{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#a855f7] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-3 text-sm text-white/50">Keep this page open until it finishes.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="flex h-14 w-full items-center justify-center rounded-full bg-white text-lg font-semibold text-black transition disabled:opacity-40"
          >
            Upload
          </button>
        )}

        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>

      <p className="mt-6 text-center text-sm text-white/45">
        <Link href="/products" className="underline underline-offset-4">
          Back to products
        </Link>
      </p>
    </div>
  );
}
