"use client";

import { useSyncExternalStore } from "react";

const KEY = "paceco-recent-v1";
const MAX = 8;

let slugs: string[] = [];
let hydrated = false;
const listeners = new Set<() => void>();
const EMPTY: string[] = [];

function emit() {
  listeners.forEach((l) => l());
}
function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs));
  } catch {
    /* ignore */
  }
}
function load() {
  if (typeof window === "undefined" || hydrated) return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) slugs = JSON.parse(raw) as string[];
  } catch {
    slugs = [];
  }
  hydrated = true;
}

export const recentStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): string[] {
    return slugs;
  },
  getServerSnapshot(): string[] {
    return EMPTY;
  },
  push(slug: string) {
    load();
    slugs = [slug, ...slugs.filter((s) => s !== slug)].slice(0, MAX);
    persist();
    emit();
  },
};

export function useRecentlyViewed() {
  return useSyncExternalStore(
    recentStore.subscribe,
    recentStore.getSnapshot,
    recentStore.getServerSnapshot
  );
}
