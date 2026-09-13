import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";
import { ReturnIcon, ShieldIcon, StoreIcon, TruckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "About",
  description:
    "Pace & Co. brings fashion and footwear together under one roof — the story behind the brand and what we stand for.",
};

const VALUES = [
  { icon: ShieldIcon, title: "Quality first", copy: "We stock pieces we'd wear ourselves — checked, and built to last." },
  { icon: ReturnIcon, title: "Fair & flexible", copy: "Free size exchange and 7-day returns, because getting it right matters." },
  { icon: StoreIcon, title: "Rooted locally", copy: "A neighbourhood store at heart, now serving the whole city." },
  { icon: TruckIcon, title: "Made easy", copy: "Browse online, order on WhatsApp, or drop by — whatever suits you." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-8">
        <p className="eyebrow">Our story</p>
        <h1 className="display-section mt-2">Fashion &amp; footwear, one roof</h1>
      </div>

      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-grey">
          <Image
            src="/images/category-footwear.jpg"
            alt="Inside the Pace & Co. store"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            {site.name} started with a simple idea: you shouldn&apos;t have to
            visit three stores to put together one outfit. We bring clothing,
            footwear and accessories together so your tee, your jeans and the
            sneakers to finish the fit all live in one place.
          </p>
          <p>
            We&apos;re a fashion brand with a serious footwear collection — not a
            shoe shop that happens to sell a few shirts. From everyday staples
            and elevated essentials to performance runners and leather boots,
            everything is chosen to work together.
          </p>
          <p>
            Based in Ahmedabad and built for people who keep moving, we care
            about fit, comfort and honest value. Come in, try things on, and
            let us help you find what actually works for you.
          </p>
          <div className="pt-2">
            <Link href="/shop" className="btn btn-primary">
              Shop the collection
            </Link>
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="mt-16">
        <div className="mb-8">
          <p className="eyebrow">What we stand for</p>
          <h2 className="display-section mt-2">Our values</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-card bg-grey p-6">
              <span className="grid h-12 w-12 place-items-center rounded-chip bg-surface text-ink">
                <v.icon width={24} height={24} />
              </span>
              <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide">
                {v.title}
              </h3>
              <p className="mt-1.5 text-xs text-muted">{v.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
