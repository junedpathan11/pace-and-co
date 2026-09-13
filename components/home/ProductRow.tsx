import Link from "next/link";
import type { Product } from "@/content/types";
import ProductCard from "@/components/product/ProductCard";
import ScrollRow from "@/components/ui/ScrollRow";
import Reveal from "@/components/ui/Reveal";

export default function ProductRow({
  eyebrow,
  title,
  products,
  viewAllHref,
  viewAllLabel = "View all",
}: {
  eyebrow: string;
  title: string;
  products: Product[];
  viewAllHref: string;
  viewAllLabel?: string;
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <Reveal>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="display-section mt-2">{title}</h2>
          </div>
          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-semibold uppercase tracking-wider text-ink hover:text-primary"
          >
            {viewAllLabel} →
          </Link>
        </div>
      </Reveal>
      <ScrollRow ariaLabel={title}>
        {products.map((p) => (
          <div
            key={p.id}
            className="w-[260px] shrink-0 snap-start sm:w-[280px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </ScrollRow>
    </section>
  );
}
