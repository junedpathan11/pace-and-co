"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { CloseIcon } from "@/components/ui/icons";

const KEY = "paceco-demobar-dismissed-v1";

export default function DemoBar() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative bg-grey text-muted">
      <div className="mx-auto flex max-w-[1400px] items-center justify-center px-4 py-1.5">
        <p className="text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          {site.demoLabel} — fictional brand, no real orders processed
        </p>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            try {
              window.localStorage.setItem(KEY, "true");
            } catch {
              /* ignore */
            }
          }}
          aria-label="Dismiss demo notice"
          className="absolute right-3 grid h-6 w-6 place-items-center rounded-chip hover:bg-ink/10"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
}
