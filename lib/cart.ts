"use client";

import { useSyncExternalStore } from "react";

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
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (raw) cart = JSON.parse(raw) as CartItem[];
  } catch {
    cart = [];
  }
  hydrated = true;
}

function itemKey(productId: string, size: string, color: string) {
  return `${productId}__${size}__${color}`;
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CART_KEY) {
      try {
        cart = e.newValue ? (JSON.parse(e.newValue) as CartItem[]) : [];
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
          ? { ...c, qty: c.qty + item.qty }
          : c
      );
    } else {
      cart = [...cart, item];
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
        itemKey(c.productId, c.size, c.color) === key ? { ...c, qty } : c
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
            ? { ...c, qty: c.qty + moving.qty }
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
