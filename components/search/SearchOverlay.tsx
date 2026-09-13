"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { uiStore, useUI, getRecentSearches, pushRecentSearch } from "@/lib/ui";
import { searchProducts, searchSuggestions } from "@/lib/search";
import { formatINR } from "@/lib/whatsapp";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";

export default function SearchOverlay() {
  const ui = useUI();
  const open = ui.searchOpen;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => searchProducts(query, 8), [query]);

  useEffect(() => {
    if (open) {
      setRecent(getRecentSearches());
      setQuery("");
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") uiStore.closeSearch();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      }
      if (e.key === "Enter") {
        if (activeIndex >= 0 && results[activeIndex]) {
          goToProduct(results[activeIndex].slug);
        } else if (query.trim()) {
          submitSearch();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, activeIndex, query]);

  function goToProduct(slug: string) {
    pushRecentSearch(query.trim() || slug);
    uiStore.closeSearch();
    router.push(`/product/${slug}`);
  }

  function submitSearch(term?: string) {
    const t = (term ?? query).trim();
    if (!t) return;
    pushRecentSearch(t);
    uiStore.closeSearch();
    router.push(`/shop?q=${encodeURIComponent(t)}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="absolute inset-0 bg-ink/40" onClick={() => uiStore.closeSearch()} />

      <div className="relative mx-auto mt-0 w-full max-w-2xl bg-surface shadow-[var(--shadow-lift)] sm:mt-16 sm:rounded-card">
        {/* Input row */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <SearchIcon className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(-1);
            }}
            placeholder="Search products, brands, categories…"
            aria-label="Search"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={
              activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
            }
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={() => uiStore.closeSearch()}
            aria-label="Close search"
            className="grid h-9 w-9 place-items-center rounded-chip hover:bg-grey"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {query.trim() === "" ? (
            <div className="space-y-6">
              {recent.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => submitSearch(r)}
                        className="chip"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="eyebrow mb-3">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submitSearch(s)}
                      className="chip"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted">
                No results for “{query}”.
              </p>
              <p className="mt-1 text-xs text-muted">
                Try a brand, category, or product type.
              </p>
            </div>
          ) : (
            <ul id="search-results" role="listbox" className="space-y-1">
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === activeIndex} id={`search-result-${i}`}>
                  <button
                    type="button"
                    onClick={() => goToProduct(p.slug)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 rounded-img px-2 py-2 text-left transition-colors ${
                      i === activeIndex ? "bg-grey" : "hover:bg-grey"
                    }`}
                  >
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-img bg-grey">
                      <Image
                        src={p.images.main}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="eyebrow">{p.brand}</p>
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs capitalize text-muted">
                        {p.subcategory}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular">
                      {formatINR(p.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
