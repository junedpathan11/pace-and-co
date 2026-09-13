import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/whatsapp";
import { getProductBySlug } from "@/content/products";

export default function Hero() {
  const featured = getProductBySlug("urbankicks-court-low");

  return (
    <section className="relative border-b border-border bg-bg">
      <div className="mx-auto grid max-w-[1400px] items-stretch gap-0 px-4 py-8 md:py-12 lg:grid-cols-2 lg:gap-10">
        {/* Copy */}
        <div className="flex flex-col justify-center py-6 lg:py-16">
          <p
            className="eyebrow hero-line"
            style={{ animationDelay: "0ms" }}
          >
            New season · Autumn drop 2026
          </p>
          <h1 className="mt-4 text-ink">
            <span
              className="hero-line display-hero block"
              style={{ animationDelay: "60ms" }}
            >
              Run
            </span>
            <span
              className="hero-line display-hero block"
              style={{ animationDelay: "120ms" }}
            >
              the
            </span>
            <span
              className="hero-line display-hero block text-primary"
              style={{ animationDelay: "180ms" }}
            >
              city.
            </span>
          </h1>
          <p
            className="hero-line mt-6 max-w-md text-base text-muted"
            style={{ animationDelay: "240ms" }}
          >
            Fashion, footwear and accessories under one roof. Fresh silhouettes,
            everyday staples and the sneakers to tie it all together.
          </p>
          <div
            className="hero-line mt-8 flex flex-wrap gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <Link href="/shop?sort=newest" className="btn btn-red">
              Shop New Arrivals
            </Link>
            <Link href="/shop/footwear" className="btn btn-secondary">
              Explore Footwear
            </Link>
          </div>
        </div>

        {/* Campaign image + featured product treatment */}
        <div
          className="hero-line relative overflow-hidden rounded-card"
          style={{ animationDelay: "160ms" }}
        >
          <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:h-full lg:min-h-[560px]">
            <Image
              src="/images/hero.jpg"
              alt="Pace & Co. autumn campaign — street style in the city at dawn"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
            />
          </div>

          {featured && (
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-card bg-surface/95 p-3 pr-5 shadow-[var(--shadow-lift)] backdrop-blur">
              <div className="relative h-16 w-14 overflow-hidden rounded-img bg-grey">
                <Image
                  src={featured.images.main}
                  alt={featured.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="badge-new">New Drop</span>
                <p className="mt-1 text-sm font-medium leading-tight">
                  {featured.name}
                </p>
                <p className="tabular text-sm font-semibold">
                  {formatINR(featured.price)}
                </p>
              </div>
              <Link
                href={`/product/${featured.slug}`}
                className="ml-2 text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
              >
                Shop
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
