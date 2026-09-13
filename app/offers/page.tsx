import type { Metadata } from "next";
import Image from "next/image";
import { getSaleProducts } from "@/content/products";
import ProductCard from "@/components/product/ProductCard";
import Countdown from "@/components/offers/Countdown";

export const metadata: Metadata = {
  title: "Sale & offers",
  description:
    "Shop the Pace & Co. monsoon edit — clothing, footwear and accessories at up to 40% off while stocks last.",
};

export default function OffersPage() {
  const sale = getSaleProducts();

  return (
    <div>
      {/* Campaign hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative aspect-[16/9] w-full md:aspect-[3/1]">
          <Image
            src="/images/hero.jpg"
            alt="Sale campaign"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-ink/55" />
        </div>
        <div className="absolute inset-0">
          <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-4 text-white">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/80">
              Monsoon edit
            </p>
            <h1 className="display-hero mt-2 max-w-2xl">Up to 40% off</h1>
            <p className="mt-3 max-w-md text-sm text-white/85">
              Season staples marked down across clothing, footwear and
              accessories. Grab yours before they&apos;re gone.
            </p>
            <div className="mt-6">
              <Countdown />
            </div>
          </div>
        </div>
      </section>

      {/* Sale grid */}
      <section className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">On sale now</p>
            <h2 className="display-section mt-2">{sale.length} deals</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sale.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
