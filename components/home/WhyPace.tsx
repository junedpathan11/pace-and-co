import Reveal from "@/components/ui/Reveal";
import {
  ReturnIcon,
  TruckIcon,
  ShieldIcon,
  StoreIcon,
} from "@/components/ui/icons";

const STATS = [
  { icon: ReturnIcon, title: "Free size exchange", copy: "Swap sizes at no cost, in store or by post." },
  { icon: TruckIcon, title: "7-day returns", copy: "Changed your mind? Return within a week." },
  { icon: ShieldIcon, title: "Genuine products", copy: "Every piece is authentic, quality-checked." },
  { icon: StoreIcon, title: "Store pickup", copy: "Order online, collect from our Ahmedabad store." },
];

export default function WhyPace() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-[1400px] px-4 py-16">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="eyebrow">Why Pace &amp; Co.</p>
            <h2 className="display-section mt-2">Built around you</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.title} delay={i * 70}>
              <div className="flex flex-col items-center text-center">
                <span className="grid h-14 w-14 place-items-center rounded-chip bg-grey text-ink">
                  <s.icon width={26} height={26} />
                </span>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted">{s.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
