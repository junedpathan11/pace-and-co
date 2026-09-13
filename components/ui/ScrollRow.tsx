"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "./icons";

/** Horizontal snap-scroll row with prev/next controls. */
export default function ScrollRow({
  children,
  ariaLabel,
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="grid h-11 w-11 place-items-center rounded-chip border border-ink hover:bg-ink hover:text-white"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="grid h-11 w-11 place-items-center rounded-chip border border-ink hover:bg-ink hover:text-white"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
