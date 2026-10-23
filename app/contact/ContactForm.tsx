"use client";

import { useEffect, useRef, useState } from "react";

// Messages written in for the visitor, picked by ?topic= in the link
function prefill(params: URLSearchParams) {
  const topic = params.get("topic");
  if (topic === "launch") {
    return "Hi! I'd like to be notified when Fight IQ launches on iPhone.";
  }
  if (topic === "order") {
    const order = (params.get("order") ?? "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);
    return order ? `Hi, I need help with my order ${order}.\n\n` : "Hi, I need help with my order.\n\n";
  }
  return "";
}

type State = "idle" | "sending" | "sent";

export default function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState("");
  const [website, setWebsite] = useState(""); // hidden field, only bots fill it
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const openedAt = useRef(0);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    openedAt.current = Date.now();
    const params = new URLSearchParams(window.location.search);
    const text = prefill(params);
    setTopic(params.get("topic") ?? "");
    if (text) {
      setMessage((m) => m || text);
      // Message is ready, so the only thing left to fill in is the email
      emailRef.current?.focus();
    }
  }, []);

  async function send() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email so we can reply.");
      return;
    }
    if (message.trim().length < 2) {
      setError("Write a message first.");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          topic,
          website,
          elapsed: Date.now() - openedAt.current,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your message. Try again.");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your message. Try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a855f7]/15">
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#c084fc" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-semibold">Message sent</h2>
        <p className="mx-auto mt-3 max-w-xs text-white/65">
          {"Thanks! We'll reply to "}
          <span className="text-white">{email.trim()}</span>.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-base text-white placeholder:text-white/35 outline-none transition focus:border-[#a855f7]/70 focus:bg-white/[0.06]";

  return (
    <form
      className="mt-10 space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (state !== "sending") send();
      }}
    >
      <div>
        <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-white/70">
          Email
        </label>
        <input
          ref={emailRef}
          id="contact-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={`${field} h-14`}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-white/70">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={6}
          maxLength={5000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
          className={`${field} resize-y py-4 leading-relaxed`}
        />
      </div>

      {/* Hidden from people, catches spam bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="flex h-14 w-full items-center justify-center rounded-full bg-white text-lg font-semibold text-black shadow-[0_0_40px_rgba(168,85,247,0.35)] transition disabled:opacity-60"
      >
        {state === "sending" ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
