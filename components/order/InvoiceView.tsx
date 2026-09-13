"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { useMounted } from "@/lib/useMounted";
import { formatINR } from "@/lib/whatsapp";
import {
  formatOrderDate,
  orderStore,
  type DemoOrder,
} from "@/lib/order";
import OrderQR from "@/components/order/OrderQR";
import { MissingOrder, orderWhatsAppLink } from "@/components/order/OrderSuccessView";
import { ChevronLeft, PrinterIcon, WhatsAppIcon } from "@/components/ui/icons";

/**
 * Compact, scannable order reference encoded in the invoice QR.
 *
 * Deliberately NOT a payment code: it carries the order/invoice numbers, the
 * amount due and the order status so a staff member can scan it and identify
 * the order. Kept short so the QR stays low-density and prints cleanly.
 */
export function orderQRPayload(order: DemoOrder): string {
  return [
    site.name,
    `Order: ${order.orderId}`,
    `Invoice: ${order.invoiceId}`,
    `Date: ${formatOrderDate(order.placedAt)}`,
    `Amount: INR ${order.totals.total}`,
    `Status: ${order.status}`,
  ].join("\n");
}

export default function InvoiceView({ orderId }: { orderId: string }) {
  const mounted = useMounted();
  const [order, setOrder] = useState<DemoOrder | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(orderStore.get(orderId));
  }, [orderId]);

  if (!mounted) return <div className="min-h-[60vh]" aria-hidden />;
  if (!order) return <MissingOrder orderId={orderId} />;

  const { customer, totals, items } = order;
  const addressLines = [
    customer.address1,
    customer.address2,
    `${customer.city}, ${customer.state} ${customer.pincode}`,
    "India",
  ].filter((l) => l && l.trim());

  return (
    <>
      {/* Screen-only toolbar */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/order-success/${order.orderId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-ink hover:text-primary"
        >
          <ChevronLeft width={16} height={16} /> Back to order
        </Link>
        <div className="flex flex-wrap gap-3">
          <a
            href={orderWhatsAppLink(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <WhatsAppIcon width={18} height={18} /> Send on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary"
          >
            <PrinterIcon width={18} height={18} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ================= INVOICE DOCUMENT ================= */}
      <article
        id="invoice-document"
        className="mx-auto max-w-[820px] rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-10"
        aria-label={`Invoice ${order.invoiceId}`}
      >
        {/* Masthead */}
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-ink pb-6">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-ink">
              {site.wordmark}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              Fashion + Footwear
            </p>
            <address className="mt-3 text-xs not-italic leading-relaxed text-muted">
              {site.address}
              <br />
              {site.phone} · {site.email}
            </address>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight">
              Invoice
            </h1>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted">Invoice no.</dt>
                <dd className="font-semibold tabular">{order.invoiceId}</dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted">Order no.</dt>
                <dd className="font-semibold tabular">{order.orderId}</dd>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <dt className="text-muted">Order date</dt>
                <dd className="font-semibold">{formatOrderDate(order.placedAt)}</dd>
              </div>
            </dl>
          </div>
        </header>

        {/* Parties */}
        <section className="grid gap-6 border-b border-border py-6 sm:grid-cols-2">
          <div>
            <h2 className="eyebrow">Billed to</h2>
            <p className="mt-2 text-sm font-semibold">{customer.fullName}</p>
            <p className="text-xs break-words text-muted">{customer.email}</p>
            <p className="text-xs text-muted tabular">{customer.phone}</p>
          </div>
          <div>
            <h2 className="eyebrow">Shipping address</h2>
            <address className="mt-2 text-xs not-italic leading-relaxed text-muted">
              <span className="block text-sm font-semibold text-ink">
                {customer.fullName}
              </span>
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
        </section>

        {/* Line items */}
        <section className="py-6">
          <h2 className="sr-only">Items</h2>

          {/* Desktop / print table */}
          <table className="hidden w-full text-left text-sm sm:table">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Product
                </th>
                <th scope="col" className="pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Variant
                </th>
                <th scope="col" className="pb-2 text-right text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Qty
                </th>
                <th scope="col" className="pb-2 text-right text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Price
                </th>
                <th scope="col" className="pb-2 text-right text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i) => (
                <tr key={`${i.productId}-${i.size}-${i.color}`}>
                  <td className="py-3 pr-3 align-top">
                    <span className="block font-medium">{i.name}</span>
                    <span className="block text-xs text-muted">{i.brand}</span>
                  </td>
                  <td className="py-3 pr-3 align-top text-xs text-muted">
                    {i.sizeLabel} / {i.color}
                  </td>
                  <td className="py-3 text-right align-top tabular">{i.qty}</td>
                  <td className="py-3 text-right align-top tabular">
                    {formatINR(i.price)}
                  </td>
                  <td className="py-3 text-right align-top font-medium tabular">
                    {formatINR(i.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile stacked list */}
          <ul className="divide-y divide-border border-y border-border sm:hidden">
            {items.map((i) => (
              <li key={`${i.productId}-${i.size}-${i.color}`} className="py-3">
                <p className="text-sm font-medium">{i.name}</p>
                <p className="text-xs text-muted">{i.brand}</p>
                <p className="mt-1 text-xs text-muted">
                  {i.sizeLabel} / {i.color}
                </p>
                <p className="mt-1.5 flex justify-between text-xs tabular">
                  <span className="text-muted">
                    {i.qty} × {formatINR(i.price)}
                  </span>
                  <span className="font-semibold">{formatINR(i.lineTotal)}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Totals + QR */}
        <section className="flex flex-col gap-8 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="order-2 sm:order-1">
            <OrderQR
              value={orderQRPayload(order)}
              label={`Order reference QR code for order ${order.orderId}, invoice ${order.invoiceId}, total ${formatINR(totals.total)}`}
              caption="Order reference"
              size={104}
            />
            <p className="mt-2 max-w-[180px] text-center text-[0.625rem] leading-relaxed text-muted">
              Scan to read this order&apos;s reference details. Not a payment
              code.
            </p>
          </div>

          <dl className="order-1 w-full text-sm sm:order-2 sm:max-w-[280px]">
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular font-medium">{formatINR(totals.subtotal)}</dd>
            </div>
            {totals.savings > 0 && (
              <div className="flex justify-between gap-4 py-1.5 text-primary">
                <dt>Discount</dt>
                <dd className="tabular font-medium">−{formatINR(totals.savings)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular font-medium">
                {totals.delivery === 0 ? "Free" : formatINR(totals.delivery)}
              </dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t-2 border-ink pt-3">
              <dt className="font-display text-base font-extrabold uppercase">
                Grand total
              </dt>
              <dd className="font-display text-base font-extrabold tabular">
                {formatINR(totals.total)}
              </dd>
            </div>
            <div className="mt-4 flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted">Payment method</dt>
              <dd className="text-right font-medium">{order.paymentLabel}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-muted">Order status</dt>
              <dd className="text-right font-medium">{order.status}</dd>
            </div>
          </dl>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-5 text-[0.6875rem] leading-relaxed text-muted">
          <p className="font-semibold uppercase tracking-[0.14em] text-ink">
            Thank you for shopping with {site.name}
          </p>
          <p className="mt-2">
            Free size exchange · 7-day returns · Questions? {site.whatsapp.display}
          </p>
          <p className="mt-2">
            {site.name} is a concept demo storefront. This invoice is a sample
            document — no payment has been processed and no goods will be
            dispatched. Amounts are shown in Indian Rupees (INR).
          </p>
        </footer>
      </article>
    </>
  );
}
