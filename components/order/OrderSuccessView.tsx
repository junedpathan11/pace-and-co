"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { useMounted } from "@/lib/useMounted";
import { buildWhatsAppLink, placedOrderMessage } from "@/lib/whatsapp";
import {
  estimatedDelivery,
  formatOrderDate,
  isValidOrderId,
  orderStore,
  type DemoOrder,
} from "@/lib/order";
import OrderSummary from "@/components/checkout/OrderSummary";
import { CheckIcon, ReceiptIcon, TruckIcon, WhatsAppIcon } from "@/components/ui/icons";

export function orderWhatsAppLink(order: DemoOrder): string {
  const { customer } = order;
  return buildWhatsAppLink(
    placedOrderMessage({
      orderId: order.orderId,
      customerName: customer.fullName,
      lines: order.items.map((i) => ({
        name: i.name,
        brand: i.brand,
        variant: `${i.sizeLabel} / ${i.color}`,
        qty: i.qty,
        lineTotal: i.lineTotal,
      })),
      total: order.totals.total,
      address: [
        customer.address1,
        customer.address2,
        `${customer.city} ${customer.pincode}`,
        customer.state,
      ]
        .filter((p) => p && p.trim())
        .join(", "),
    })
  );
}

/** Shared empty state for "we can't find that order on this device". */
export function MissingOrder({ orderId }: { orderId?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card bg-grey py-20 text-center">
      <ReceiptIcon width={44} height={44} className="text-muted" />
      <h1 className="font-display mt-4 text-2xl font-extrabold uppercase">
        Order not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {orderId && isValidOrderId(orderId) ? (
          <>
            We couldn&apos;t find order{" "}
            <span className="font-medium text-ink tabular">{orderId}</span> on
            this device. Demo orders are stored locally in your browser, so they
            won&apos;t appear in a different browser, on another device, or after
            clearing site data.
          </>
        ) : (
          <>That order reference doesn&apos;t look right. Check the link, or start a new order.</>
        )}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link href="/cart" className="btn btn-secondary">
          View bag
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessView({ orderId }: { orderId: string }) {
  const mounted = useMounted();
  const [order, setOrder] = useState<DemoOrder | null>(null);

  useEffect(() => {
    // Read after mount: localStorage isn't available during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrder(orderStore.get(orderId));
  }, [orderId]);

  if (!mounted) return <div className="min-h-[60vh]" aria-hidden />;
  if (!order) return <MissingOrder orderId={orderId} />;

  const { customer, totals } = order;
  const addressLines = [
    customer.address1,
    customer.address2,
    `${customer.city}, ${customer.state} ${customer.pincode}`,
    "India",
  ].filter((l) => l && l.trim());

  return (
    <div>
      {/* Confirmation header */}
      <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
        <span className="grid h-12 w-12 place-items-center rounded-chip bg-primary text-white">
          <CheckIcon width={26} height={26} />
        </span>
        <h1 className="display-section mt-5">Order placed</h1>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Thanks {customer.fullName.split(" ")[0]} — your order is in. We&apos;ve
          recorded the details below and will confirm stock and delivery with you
          shortly.
        </p>

        <dl className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <div>
            <dt className="eyebrow">Order number</dt>
            <dd className="mt-1 text-sm font-semibold tabular">{order.orderId}</dd>
          </div>
          <div>
            <dt className="eyebrow">Order date</dt>
            <dd className="mt-1 text-sm font-semibold">
              {formatOrderDate(order.placedAt)}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Order status</dt>
            <dd className="mt-1 text-sm font-semibold">{order.status}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/invoice/${order.orderId}`} className="btn btn-primary">
            <ReceiptIcon width={18} height={18} /> View invoice
          </Link>
          <a
            href={orderWhatsAppLink(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <WhatsAppIcon width={18} height={18} /> Order via WhatsApp
          </a>
          <Link href="/shop" className="btn btn-ghost">
            Continue shopping
          </Link>
        </div>

        {!order.notified && (
          <p className="mt-5 rounded-card border border-border bg-bg p-3 text-xs text-muted">
            Store email notifications aren&apos;t configured on this demo
            deployment, so nothing was emailed. Your order is saved in this
            browser — use the WhatsApp option above to send it to us directly.
          </p>
        )}
      </div>

      {/* Estimated delivery */}
      <div className="mt-6 flex items-start gap-3 rounded-card border border-border bg-surface p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-chip bg-grey text-ink">
          <TruckIcon width={20} height={20} />
        </span>
        <div>
          <p className="text-sm font-semibold">
            Estimated delivery: {estimatedDelivery(order.placedAt)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Standard delivery, {site.standardDeliveryEta}. We&apos;ll be in touch
            on {customer.phone} to confirm before dispatch.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Customer + address + payment */}
        <div className="min-w-0 space-y-6">
          <section
            aria-labelledby="details-heading"
            className="rounded-card border border-border bg-surface p-5 sm:p-6"
          >
            <h2 id="details-heading" className="font-display text-xl font-extrabold uppercase">
              Delivery details
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Customer</p>
                <p className="mt-1.5 text-sm font-medium">{customer.fullName}</p>
                <p className="text-sm break-words text-muted">{customer.email}</p>
                <p className="text-sm text-muted tabular">{customer.phone}</p>
              </div>
              <div>
                <p className="eyebrow">Delivery address</p>
                <address className="mt-1.5 text-sm not-italic text-muted">
                  {addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </div>
              <div>
                <p className="eyebrow">Payment method</p>
                <p className="mt-1.5 text-sm font-medium">{order.paymentLabel}</p>
                <p className="mt-0.5 text-xs text-muted">
                  No payment has been taken — this is a concept demo store.
                </p>
              </div>
              <div>
                <p className="eyebrow">Invoice number</p>
                <p className="mt-1.5 text-sm font-medium tabular">{order.invoiceId}</p>
                <Link
                  href={`/invoice/${order.orderId}`}
                  className="mt-1 inline-block text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  View invoice →
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* Items ordered */}
        <aside className="min-w-0">
          <div className="rounded-card bg-grey p-5 sm:p-6">
            <OrderSummary
              heading="Items ordered"
              lines={order.items.map((i) => ({
                key: `${i.productId}-${i.size}-${i.color}`,
                name: i.name,
                brand: i.brand,
                image: i.image,
                color: i.color,
                sizeLabel: i.sizeLabel,
                qty: i.qty,
                price: i.price,
                lineTotal: i.lineTotal,
              }))}
              totals={totals}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
