"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * Order-reference QR code.
 *
 * IMPORTANT: this encodes an order reference only. It is NOT a payment code
 * and scanning it proves nothing about payment — this is a demo storefront
 * with no payment gateway. Labelling must stay neutral ("Order reference").
 */
export default function OrderQR({
  value,
  label,
  caption,
  size = 108,
}: {
  value: string;
  /** Accessible description of what the code contains. */
  label: string;
  caption: string;
  size?: number;
}) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="rounded-img border border-border bg-white p-2">
        <QRCodeSVG
          value={value}
          size={size}
          level="M"
          marginSize={0}
          bgColor="#FFFFFF"
          fgColor="#191919"
          title={label}
          role="img"
          aria-label={label}
        />
      </div>
      <figcaption className="text-center text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
