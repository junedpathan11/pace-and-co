"use client";

import { useSyncExternalStore } from "react";

interface UIState {
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
}

let state: UIState = {
  cartDrawerOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
};

const listeners = new Set<() => void>();
function emit() {
  state = { ...state };
  listeners.forEach((l) => l());
}

export const uiStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  openCart() {
    state.cartDrawerOpen = true;
    state.searchOpen = false;
    emit();
  },
  closeCart() {
    state.cartDrawerOpen = false;
    emit();
  },
  openSearch() {
    state.searchOpen = true;
    state.cartDrawerOpen = false;
    emit();
  },
  closeSearch() {
    state.searchOpen = false;
    emit();
  },
  openMobileMenu() {
    state.mobileMenuOpen = true;
    emit();
  },
  closeMobileMenu() {
    state.mobileMenuOpen = false;
    emit();
  },
};

export function useUI() {
  return useSyncExternalStore(
    uiStore.subscribe,
    uiStore.getSnapshot,
    uiStore.getSnapshot
  );
}

// Recent searches (localStorage)
const SEARCH_KEY = "paceco-recent-searches-v1";
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
export function pushRecentSearch(term: string) {
  if (typeof window === "undefined" || !term.trim()) return;
  const current = getRecentSearches();
  const next = [term, ...current.filter((t) => t !== term)].slice(0, 6);
  try {
    window.localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
