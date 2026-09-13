"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { getProductById } from "@/content/lookup";
import { formatSizeLabel, getVariant } from "@/content/products";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  size: string;
  color: string;
  sizeLabel: string; // e.g. "Size M" or "UK 9"
  price: number;
  compareAtPrice?: number;
  qty: number;
}

const CART_KEY = "paceco-cart-v1";

/** Upper bound for a single cart line — also guards tampered storage values. */
export const MAX_QTY_PER_LINE = 10;

function clampQty(qty: unknown): number {
  const n = typeof qty === "number" ? qty : Number(qty);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_QTY_PER_LINE, Math.max(1, Math.floor(n)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Rebuild a stored cart line from the product catalogue.
 *
 * localStorage is user-writable, so nothing in it is trusted: the product must
 * still exist, and name / brand / image / price always come from product data.
 * Returns null when the line can no longer be resolved to a product.
 */
function sanitizeLine(raw: unknown): CartItem | null {
  if (!isRecord(raw)) return null;
  const productId = typeof raw.productId === "string" ? raw.productId : "";
  const product = getProductById(productId);
  if (!product) return null;

  const size =
    typeof raw.size === "string" && raw.size.trim() ? raw.size : "One Size";
  const color =
    typeof raw.color === "string" && raw.color.trim()
      ? raw.color
      : (product.colors[0]?.name ?? "");

  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.images.main,
    size,
    color,
    sizeLabel: formatSizeLabel(product, size),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    qty: clampQty(raw.qty),
  };
}

function sameLines(a: CartItem[], b: CartItem[]): boolean {
  return a.length === b.length && a.every((item, i) => {
    const other = b[i];
    return (
      isRecord(other) &&
      item.productId === other.productId &&
      item.size === other.size &&
      item.color === other.color &&
      item.qty === other.qty &&
      item.price === other.price &&
      item.sizeLabel === other.sizeLabel
    );
  });
}

/**
 * Drop unresolvable lines, merge duplicates and refresh catalogue-owned fields.
 * Used on every read from storage so the drawer, cart page and checkout can
 * never disagree about what is in the bag or what it costs.
 */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const merged: CartItem[] = [];
  for (const entry of raw) {
    const line = sanitizeLine(entry);
    if (!line) continue;
    const existing = merged.find(
      (m) => m.productId === line.productId && m.size === line.size && m.color === line.color
    );
    if (existing) existing.qty = clampQty(existing.qty + line.qty);
    else merged.push(line);
  }
  return merged;
}

let cart: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* storage unavailable — ignore */
  }
}

function load() {
  if (typeof window === "undefined" || hydrated) return;
  let stored: unknown = null;
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }
  const clean = sanitizeCart(stored);
  cart = clean;
  hydrated = true;
  // Corrupted/stale entries were dropped — write the repaired cart back.
  if (Array.isArray(stored) && !sameLines(clean, stored as CartItem[])) persist();
}

function itemKey(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) {
      try {
        cart = e.newValue ? sanitizeCart(JSON.parse(e.newValue)) : [];
      } catch {
        cart = [];
      }
      emit();
    }
  });
}

export const cartStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): CartItem[] {
    return cart;
  },
  getServerSnapshot(): CartItem[] {
    return EMPTY;
  },
  add(item: CartItem) {
    load();
    const key = itemKey(item.productId, item.size, item.color);
    const existing = cart.find(
      (c) => itemKey(c.productId, c.size, c.color) === key
    );
    if (existing) {
      cart = cart.map((c) =>
        itemKey(c.productId, c.size, c.color) === key
          ? { ...c, qty: clampQty(c.qty + item.qty) }
          : c
      );
    } else {
      cart = [...cart, { ...item, qty: clampQty(item.qty) }];
    }
    persist();
    emit();
  },
  updateQty(productId: string, size: string, color: string, qty: number) {
    load();
    const key = itemKey(productId, size, color);
    if (qty <= 0) {
      cart = cart.filter((c) => itemKey(c.productId, c.size, c.color) !== key);
    } else {
      cart = cart.map((c) =>
        itemKey(c.productId, c.size, c.color) === key
          ? { ...c, qty: clampQty(qty) }
          : c
      );
    }
    persist();
    emit();
  },
  changeVariant(
    productId: string,
    oldSize: string,
    oldColor: string,
    next: { size: string; color: string; sizeLabel: string }
  ) {
    load();
    const oldKey = itemKey(productId, oldSize, oldColor);
    const newKey = itemKey(productId, next.size, next.color);
    const moving = cart.find(
      (c) => itemKey(c.productId, c.size, c.color) === oldKey
    );
    if (!moving) return;
    // If target already exists, merge quantities.
    const target = cart.find(
      (c) => itemKey(c.productId, c.size, c.color) === newKey
    );
    if (target && oldKey !== newKey) {
      cart = cart
        .filter((c) => itemKey(c.productId, c.size, c.color) !== oldKey)
        .map((c) =>
          itemKey(c.productId, c.size, c.color) === newKey
            ? { ...c, qty: clampQty(c.qty + moving.qty) }
            : c
        );
    } else {
      cart = cart.map((c) =>
        itemKey(c.productId, c.size, c.color) === oldKey
          ? { ...c, size: next.size, color: next.color, sizeLabel: next.sizeLabel }
          : c
      );
    }
    persist();
    emit();
  },
  remove(productId: string, size: string, color: string) {
    load();
    const key = itemKey(productId, size, color);
    cart = cart.filter((c) => itemKey(c.productId, c.size, c.color) !== key);
    persist();
    emit();
  },
  clear() {
    load();
    cart = [];
    persist();
    emit();
  },
};

const EMPTY: CartItem[] = [];

export function useCart() {
  return useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartSavings(items: CartItem[]): number {
  return items.reduce(
    (sum, i) => sum + (i.compareAtPrice ? (i.compareAtPrice - i.price) * i.qty : 0),
    0
  );
}

export interface CartTotals {
  /** Sum of line totals at the price actually charged. */
  subtotal: number;
  /** Savings versus compare-at prices — already reflected in `subtotal`. */
  savings: number;
  delivery: number;
  deliveryLabel: string;
  total: number;
  count: number;
}

/**
 * THE pricing function. Cart page, drawer, checkout summary, invoice and the
 * Web3Forms/WhatsApp payloads all read totals from here so a number can never
 * drift between two screens.
 *
 * Demo rule: flat standard delivery, free above the site-wide threshold.
 */
export function cartTotals(items: CartItem[]): CartTotals {
  const subtotal = cartSubtotal(items);
  const savings = cartSavings(items);
  const free = items.length === 0 || subtotal >= site.freeDeliveryThreshold;
  const delivery = free ? 0 : site.standardDeliveryFee;
  return {
    subtotal,
    savings,
    delivery,
    deliveryLabel: free ? "Free" : "Standard delivery",
    total: subtotal + delivery,
    count: cartCount(items),
  };
}

/**
 * Checkout gate: is every line still orderable against current product data?
 * Guards against a variant going out of stock (or disappearing) between adding
 * to the bag and reaching checkout.
 */
export interface CartIssue {
  key: string;
  name: string;
  reason: string;
}

export function validateCart(items: CartItem[]): CartIssue[] {
  const issues: CartIssue[] = [];
  for (const item of items) {
    const key = `${item.productId}-${item.size}-${item.color}`;
    const product = getProductById(item.productId);
    if (!product) {
      issues.push({ key, name: item.name, reason: "is no longer available" });
      continue;
    }
    const variant = getVariant(product, item.size, item.color);
    if (!variant) {
      issues.push({
        key,
        name: item.name,
        reason: `is not available in ${item.sizeLabel} / ${item.color}`,
      });
      continue;
    }
    if (variant.stock === "out") {
      issues.push({
        key,
        name: item.name,
        reason: `is out of stock in ${item.sizeLabel} / ${item.color}`,
      });
    }
  }
  return issues;
}
