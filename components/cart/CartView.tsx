"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useCart,
  cartStore,
  cartTotals,
  type CartItem,
} from "@/lib/cart";
import { getProductById } from "@/content/lookup";
import { formatSizeLabel } from "@/content/products";
import { site } from "@/content/site";
import { useMounted } from "@/lib/useMounted";
import { formatINR, buildWhatsAppLink, cartOrderMessage } from "@/lib/whatsapp";
import { Price } from "@/components/ui/Price";
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  WhatsAppIcon,
  BagIcon,
  ChevronDown,
} from "@/components/ui/icons";

function sizeLabelFor(item: CartItem): string {
  return item.sizeLabel;
}

export default function CartView() {
  const cart = useCart();
  const mounted = useMounted();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  if (!mounted) {
    return <div className="min-h-[50vh]" aria-hidden />;
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card bg-grey py-20 text-center">
        <BagIcon width={44} height={44} className="text-muted" />
        <h2 className="font-display mt-4 text-2xl font-extrabold uppercase">
          Your bag is empty
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Looks like you haven&apos;t added anything yet. Let&apos;s change that.
        </p>
        <Link href="/shop" className="btn btn-primary mt-6">
          Start Shopping
        </Link>
      </div>
    );
  }

  const totals = cartTotals(cart);

  const waMessage = cartOrderMessage({
    customerName: name,
    lines: cart.map((i) => ({
      name: i.name,
      brand: i.brand,
      variant: `${sizeLabelFor(i)} / ${i.color}`,
      qty: i.qty,
      lineTotal: i.price * i.qty,
    })),
    total: totals.total,
    deliveryNote: note,
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Line items */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted tabular">
            {cart.length} {cart.length === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={() => cartStore.clear()}
            className="text-xs font-semibold uppercase tracking-wider text-muted hover:text-primary"
          >
            Remove all
          </button>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {cart.map((item) => (
            <CartLine key={`${item.productId}-${item.size}-${item.color}`} item={item} />
          ))}
        </ul>

        <Link
          href="/shop"
          className="mt-6 inline-block text-sm font-semibold uppercase tracking-wider text-ink hover:text-primary"
        >
          ← Continue shopping
        </Link>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-card bg-grey p-6">
          <h2 className="font-display text-xl font-extrabold uppercase">
            Order summary
          </h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular font-medium">{formatINR(totals.subtotal)}</dd>
            </div>
            {totals.savings > 0 && (
              <div className="flex justify-between gap-4 text-primary">
                <dt>Total savings</dt>
                <dd className="tabular font-medium">−{formatINR(totals.savings)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Delivery</dt>
              <dd className="tabular font-medium">
                {totals.delivery === 0 ? "Free" : formatINR(totals.delivery)}
              </dd>
            </div>
            <div className="mt-2 flex justify-between gap-4 border-t border-border pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="tabular font-semibold">{formatINR(totals.total)}</dd>
            </div>
          </dl>

          {/* Primary ecommerce flow */}
          <Link href="/checkout" className="btn btn-primary mt-5 w-full">
            Checkout
          </Link>

          <div className="mt-4 flex items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-border" />
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-muted">
              or
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Alternative: order over WhatsApp — still one click, as before */}
          <a
            href={buildWhatsAppLink(waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red mt-4 w-full"
          >
            <WhatsAppIcon width={18} height={18} /> Order via WhatsApp
          </a>

          {/* Optional extras that personalise the WhatsApp message. */}
          <details className="group mt-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-xs font-medium text-muted hover:text-ink">
              Add your name &amp; a delivery note
              <ChevronDown
                width={16}
                height={16}
                className="shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="mt-2 space-y-3">
              <div>
                <label htmlFor="cust-name" className="eyebrow mb-1.5 block">
                  Your name (optional)
                </label>
                <input
                  id="cust-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="min-h-11 w-full rounded-chip border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="cust-note" className="eyebrow mb-1.5 block">
                  Delivery note (optional)
                </label>
                <textarea
                  id="cust-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Address, landmark or pickup preference"
                  className="w-full resize-none rounded-card border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-ink focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
          </details>

          <p className="mt-4 text-center text-xs text-muted">
            No payment is taken on this site — {site.name} is a concept demo
            store.
          </p>
        </div>
      </aside>
    </div>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const product = getProductById(item.productId);
  const [editing, setEditing] = useState(false);

  const availableSizes = product
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : [item.size];
  const availableColors = product ? product.colors.map((c) => c.name) : [item.color];

  const sizeLabel = (size: string) =>
    product ? formatSizeLabel(product, size) : item.sizeLabel;

  function changeVariant(nextSize: string, nextColor: string) {
    cartStore.changeVariant(item.productId, item.size, item.color, {
      size: nextSize,
      color: nextColor,
      sizeLabel: sizeLabel(nextSize),
    });
    setEditing(false);
  }

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/product/${item.slug}`}
        className="relative h-28 w-24 shrink-0 overflow-hidden rounded-img bg-grey"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{item.brand}</p>
            <Link
              href={`/product/${item.slug}`}
              className="text-sm font-medium hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="mt-0.5 text-xs text-muted">
              {item.sizeLabel} · {item.color}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.name}`}
            onClick={() =>
              cartStore.remove(item.productId, item.size, item.color)
            }
            className="grid h-9 w-9 shrink-0 place-items-center rounded-chip text-muted hover:bg-grey hover:text-primary"
          >
            <TrashIcon width={16} height={16} />
          </button>
        </div>

        {/* Change variant */}
        {product && (availableSizes.length > 1 || availableColors.length > 1) && (
          <div className="mt-2">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
              >
                Change variant
              </button>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  aria-label="Change size"
                  value={item.size}
                  onChange={(e) => changeVariant(e.target.value, item.color)}
                  className="rounded-chip border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-ink"
                >
                  {availableSizes.map((s) => (
                    <option key={s} value={s}>
                      {sizeLabel(s)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Change colour"
                  value={item.color}
                  onChange={(e) => changeVariant(item.size, e.target.value)}
                  className="rounded-chip border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-ink"
                >
                  {availableColors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-xs text-muted hover:text-ink"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-chip border border-border">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() =>
                cartStore.updateQty(
                  item.productId,
                  item.size,
                  item.color,
                  item.qty - 1
                )
              }
              className="grid h-9 w-9 place-items-center hover:text-primary"
            >
              <MinusIcon width={14} height={14} />
            </button>
            <span className="w-9 text-center text-sm tabular">{item.qty}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                cartStore.updateQty(
                  item.productId,
                  item.size,
                  item.color,
                  item.qty + 1
                )
              }
              className="grid h-9 w-9 place-items-center hover:text-primary"
            >
              <PlusIcon width={14} height={14} />
            </button>
          </div>
          <Price price={item.price * item.qty} size="sm" />
        </div>
      </div>
    </li>
  );
}
