"use client";

import { useState } from "react";
import { buildWhatsAppLink, questionMessage } from "@/lib/whatsapp";
import { isWeb3FormsConfigured, submitToWeb3Forms } from "@/lib/web3forms";
import { WhatsAppIcon, CheckIcon } from "@/components/ui/icons";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const configured = isWeb3FormsConfigured();

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!configured) return;
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const fields: Record<string, string> = {
      subject: "New enquiry from Pace & Co. website",
    };
    data.forEach((value, name) => {
      if (typeof value === "string") fields[name] = value;
    });

    // Shared client: success requires HTTP ok AND success === true.
    const result = await submitToWeb3Forms(fields);
    if (!result.ok) {
      setStatus("error");
      setErrorMsg(result.error);
      return;
    }

    setStatus("success");
    form.reset();
  }

  if (status === "success") {
    return (
      <div className="rounded-card bg-grey p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-chip bg-surface text-primary">
          <CheckIcon width={26} height={26} />
        </span>
        <h3 className="font-display mt-4 text-xl font-extrabold uppercase">
          Message sent
        </h3>
        <p className="mt-2 text-sm text-muted">
          Thanks for reaching out — we&apos;ll get back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="btn btn-secondary mt-6"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!configured && (
        <div className="rounded-card border border-primary/40 bg-primary/5 p-4 text-sm text-ink">
          <p className="font-semibold">Form not configured</p>
          <p className="mt-1 text-muted">
            Add your Web3Forms access key to{" "}
            <code className="rounded bg-grey px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            (see <code className="rounded bg-grey px-1.5 py-0.5 text-xs">.env.example</code>) to
            enable submissions. You can still reach us by phone or WhatsApp below.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="eyebrow mb-1.5 block">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          disabled={!configured}
          className="min-h-11 w-full rounded-chip border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="email" className="eyebrow mb-1.5 block">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={!configured}
          aria-describedby="email-hint"
          className="min-h-11 w-full rounded-chip border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
        <p id="email-hint" className="sr-only">Enter a valid email address so we can reply.</p>
      </div>
      <div>
        <label htmlFor="phone" className="eyebrow mb-1.5 block">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          disabled={!configured}
          className="min-h-11 w-full rounded-chip border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="message" className="eyebrow mb-1.5 block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          disabled={!configured}
          className="min-h-11 w-full resize-none rounded-card border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
      </div>

      {status === "error" && (
        <div role="alert" aria-live="assertive" className="rounded-card border border-primary/40 bg-primary/5 p-4 text-sm">
          <p className="font-medium text-primary">{errorMsg}</p>
          <a
            href={buildWhatsAppLink(questionMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-ink hover:text-primary"
          >
            <WhatsAppIcon width={16} height={16} /> Message us on WhatsApp instead
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={!configured || status === "submitting"}
        className="btn btn-primary w-full"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
