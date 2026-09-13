import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const TILES = [
  {
    title: "Clothing",
    copy: "Tees, shirts, hoodies & denim",
    href: "/shop/clothing",
    img: "/images/category-clothing.jpg",
  },
  {
    title: "Footwear",
    copy: "Sneakers, runners, boots & more",
    href: "/shop/footwear",
    img: "/images/category-footwear.jpg",
  },
  {
    title: "Accessories",
    copy: "Bags, caps, belts & wallets",
    href: "/shop/accessories",
    img: "/images/category-accessories.jpg",
  },
];

export default function CategoryTiles() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <Reveal>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="display-section mt-2">Shop by category</h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold uppercase tracking-wider text-ink hover:text-primary sm:block"
          >
            View all →
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        {TILES.map((tile, i) => (
          <Reveal key={tile.title} delay={i * 80}>
            <Link
              href={tile.href}
              className="group relative block overflow-hidden rounded-card"
            >
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={tile.img}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[var(--anim-slow)] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-ink/45" />
              </div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight">
                  {tile.title}
                </h3>
                <p className="mt-1 text-sm text-white/85">{tile.copy}</p>
                <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider">
                  Shop now →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
