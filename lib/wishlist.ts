"use client";

import { useSyncExternalStore } from "react";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  // Optional remembered variant (may be re-picked when moving to cart)
  size?: string;
  color?: string;
}

const KEY = "paceco-wishlist-v1";

let items: WishlistItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();
const EMPTY: WishlistItem[] = [];

function emit() {
  listeners.forEach((l) => l());
}
function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}
function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) items = JSON.parse(raw) as WishlistItem[];
  } catch {
    items = [];
  }
  hydrated = true;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      try {
        items = e.newValue ? (JSON.parse(e.newValue) as WishlistItem[]) : [];
      } catch {
        items = [];
      }
      emit();
    }
  });
}

export const wishlistStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): WishlistItem[] {
    return items;
  },
  getServerSnapshot(): WishlistItem[] {
    return EMPTY;
  },
  toggle(item: WishlistItem) {
    load();
    const exists = items.some((i) => i.productId === item.productId);
    items = exists
      ? items.filter((i) => i.productId !== item.productId)
      : [...items, item];
    persist();
    emit();
  },
  add(item: WishlistItem) {
    load();
    if (!items.some((i) => i.productId === item.productId)) {
      items = [...items, item];
      persist();
      emit();
    }
  },
  remove(productId: string) {
    load();
    items = items.filter((i) => i.productId !== productId);
    persist();
    emit();
  },
  has(productId: string): boolean {
    load();
    return items.some((i) => i.productId === productId);
  },
};

export function useWishlist() {
  return useSyncExternalStore(
    wishlistStore.subscribe,
    wishlistStore.getSnapshot,
    wishlistStore.getServerSnapshot
  );
}
