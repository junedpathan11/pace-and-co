"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/useMounted";

// Fixed fictional end date (client-side only; labelled, no fake urgency copy).
const END = new Date("2026-10-31T23:59:59+05:30").getTime();

function parts(ms: number) {
  const clamp = Math.max(0, ms);
  const d = Math.floor(clamp / 86400000);
  const h = Math.floor((clamp % 86400000) / 3600000);
  const m = Math.floor((clamp % 3600000) / 60000);
  const s = Math.floor((clamp % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown() {
  const mounted = useMounted();
  const [now, setNow] = useState<number>(END);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { d, h, m, s } = parts(END - now);
  const cells = [
    { v: d, l: "Days" },
    { v: h, l: "Hrs" },
    { v: m, l: "Min" },
    { v: s, l: "Sec" },
  ];

  return (
    <div>
      <p className="eyebrow mb-2 text-white/80">Offer ends soon</p>
      <div className="flex gap-2">
        {cells.map((c) => (
          <div
            key={c.l}
            className="min-w-[3.5rem] rounded-img bg-surface/15 px-3 py-2 text-center backdrop-blur"
          >
            <span className="font-display block text-2xl font-extrabold tabular text-white">
              {mounted ? String(c.v).padStart(2, "0") : "--"}
            </span>
            <span className="text-[0.625rem] uppercase tracking-wider text-white/70">
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
