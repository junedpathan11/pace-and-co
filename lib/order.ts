"use client";

import { site } from "@/content/site";
import type { CartItem, CartTotals } from "@/lib/cart";

/* ============================================================================
   DEMO ORDER MODEL

   Pace & Co. is a concept demo with no database, no auth and no payment
   gateway. An "order" here is a client-side snapshot written to localStorage
   so the confirmation and invoice pages survive a refresh. Nothing below
   implies a real backend or a captured payment — order status stays
   "Pending confirmation" until the store confirms it.
   ========================================================================== */

export const ORDERS_KEY = "paceco-orders-v1";

/** How many recent demo orders to retain locally. */
const MAX_STORED_ORDERS = 10;

export type PaymentMethod = "cod" | "whatsapp";

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  whatsapp: "Confirm on WhatsApp",
};

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
}

/**
 * A frozen copy of a purchased line. Deliberately denormalised: the invoice
 * must keep showing what was ordered even if the catalogue changes later.
 */
export interface OrderLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  color: string;
  size: string;
  sizeLabel: string;
  qty: number;
  price: number;
  compareAtPrice?: number;
  lineTotal: number;
}

export interface DemoOrder {
  /** Storage schema version, so future changes can migrate or discard safely. */
  v: 1;
  orderId: string;
  invoiceId: string;
  /** ISO timestamp of when the demo order was created. */
  placedAt: string;
  customer: CustomerDetails;
  items: OrderLine[];
  totals: {
    subtotal: number;
    savings: number;
    delivery: number;
    total: number;
  };
  paymentMethod: PaymentMethod;
  paymentLabel: string;
  /** Never "Paid" — no payment is ever processed on this demo site. */
  status: string;
  /** Whether the Web3Forms notification reached the store inbox. */
  notified: boolean;
}

/* ---------------------------------------------------------------------------
   ID generation
   ------------------------------------------------------------------------- */

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

/** Crypto-backed when available, Math.random otherwise. */
function randomDigits(len: number): string {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return pad(buf[0] % 10 ** len, len);
  }
  return pad(Math.floor(Math.random() * 10 ** len), len);
}

/**
 * Demo order number, e.g. `PC-20260913-4821`.
 * Date-prefixed so it reads like a real order reference and sorts naturally.
 */
export function generateOrderId(now: Date = new Date()): string {
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  return `PC-${stamp}-${randomDigits(4)}`;
}

/** Invoice number derived from the order number, e.g. `INV-PC-20260913-4821`. */
export function invoiceIdFor(orderId: string): string {
  return `INV-${orderId}`;
}

/** Accepts `PC-YYYYMMDD-NNNN` only — used to reject junk in the URL. */
export function isValidOrderId(value: string): boolean {
  return /^PC-\d{8}-\d{4}$/.test(value);
}

export function formatOrderDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Delivery window shown on the confirmation page and invoice. */
export function estimatedDelivery(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return site.standardDeliveryEta;
  const from = new Date(d);
  from.setDate(from.getDate() + 3);
  const to = new Date(d);
  to.setDate(to.getDate() + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

/* ---------------------------------------------------------------------------
   Snapshot creation
   ------------------------------------------------------------------------- */

export function toOrderLines(items: CartItem[]): OrderLine[] {
  return items.map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    brand: i.brand,
    image: i.image,
    color: i.color,
    size: i.size,
    sizeLabel: i.sizeLabel,
    qty: i.qty,
    price: i.price,
    compareAtPrice: i.compareAtPrice,
    lineTotal: i.price * i.qty,
  }));
}

export function createOrder(input: {
  customer: CustomerDetails;
  items: CartItem[];
  totals: CartTotals;
  paymentMethod: PaymentMethod;
  now?: Date;
}): DemoOrder {
  const now = input.now ?? new Date();
  const orderId = generateOrderId(now);
  return {
    v: 1,
    orderId,
    invoiceId: invoiceIdFor(orderId),
    placedAt: now.toISOString(),
    customer: input.customer,
    items: toOrderLines(input.items),
    totals: {
      subtotal: input.totals.subtotal,
      savings: input.totals.savings,
      delivery: input.totals.delivery,
      total: input.totals.total,
    },
    paymentMethod: input.paymentMethod,
    paymentLabel: PAYMENT_LABELS[input.paymentMethod],
    // Demo storefront: an order is only ever awaiting confirmation.
    status: "Pending confirmation",
    notified: false,
  };
}

/* ---------------------------------------------------------------------------
   localStorage persistence (versioned key, corruption-tolerant)
   ------------------------------------------------------------------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** Structural check — anything that fails is treated as corrupt and skipped. */
function isDemoOrder(v: unknown): v is DemoOrder {
  if (!isRecord(v)) return false;
  return (
    v.v === 1 &&
    typeof v.orderId === "string" &&
    isValidOrderId(v.orderId) &&
    typeof v.invoiceId === "string" &&
    typeof v.placedAt === "string" &&
    isRecord(v.customer) &&
    Array.isArray(v.items) &&
    v.items.length > 0 &&
    isRecord(v.totals) &&
    typeof v.status === "string"
  );
}

function readAll(): DemoOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isDemoOrder);
  } catch {
    return [];
  }
}

function writeAll(orders: DemoOrder[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ORDERS_KEY,
      JSON.stringify(orders.slice(0, MAX_STORED_ORDERS))
    );
  } catch {
    /* quota/private mode — the in-page order still renders */
  }
}

export const orderStore = {
  save(order: DemoOrder) {
    const rest = readAll().filter((o) => o.orderId !== order.orderId);
    writeAll([order, ...rest]);
  },
  get(orderId: string): DemoOrder | null {
    if (!isValidOrderId(orderId)) return null;
    return readAll().find((o) => o.orderId === orderId) ?? null;
  },
  /** Mark the store notification as delivered after a Web3Forms success. */
  markNotified(orderId: string) {
    const all = readAll();
    const next = all.map((o) =>
      o.orderId === orderId ? { ...o, notified: true } : o
    );
    writeAll(next);
  },
};
