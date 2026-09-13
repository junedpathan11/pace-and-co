import Reveal from "@/components/ui/Reveal";
import { Rating } from "@/components/ui/Rating";

const REVIEWS = [
  {
    quote:
      "The Retro Runners fit true to size and are unbelievably comfortable for all-day wear. Delivery took just three days to Ahmedabad.",
    name: "Rhea M.",
    context: "Verified buyer · Footwear",
    rating: 5,
  },
  {
    quote:
      "Great quality hoodie — heavy fabric that actually holds its shape. The size exchange was completely free when I sized up.",
    name: "Aditya P.",
    context: "Verified buyer · Clothing",
    rating: 5,
  },
  {
    quote:
      "Loved that I could order over WhatsApp and pick up in store. The Chelsea boots look even better in person.",
    name: "Karan S.",
    context: "Verified buyer · Footwear",
    rating: 4,
  },
];

export default function Reviews() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <Reveal>
        <div className="mb-10 text-center">
          <p className="eyebrow">Loved by customers</p>
          <h2 className="display-section mt-2">What people say</h2>
        </div>
      </Reveal>
      <div className="grid gap-4 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 80}>
            <figure className="flex h-full flex-col rounded-card bg-grey p-6">
              <Rating rating={r.rating} showCount={false} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-4">
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="text-xs text-muted">{r.context}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
