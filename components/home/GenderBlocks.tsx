import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const BLOCKS = [
  {
    title: "Shop Men",
    copy: "Everyday staples, tailored basics and street-ready footwear.",
    href: "/shop?gender=men",
    img: "/images/products/oxford-everyday-shirt-a.jpg",
  },
  {
    title: "Shop Women",
    copy: "Elevated essentials, denim and versatile silhouettes.",
    href: "/shop?gender=women",
    img: "/images/products/studio-boxy-tee-women-a.jpg",
  },
  {
    title: "Shop Kids",
    copy: "Durable, playful pieces built to keep up with them.",
    href: "/shop?gender=kids",
    img: "/images/products/pacekids-graphic-tee-a.jpg",
  },
];

export default function GenderBlocks() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <div className="grid gap-4 md:grid-cols-3">
        {BLOCKS.map((b, i) => (
          <Reveal key={b.title} delay={i * 80}>
            <div className="flex h-full flex-col overflow-hidden rounded-card bg-grey">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={b.img}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight">
                  {b.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted">{b.copy}</p>
                <Link
                  href={b.href}
                  className="mt-4 inline-block text-sm font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  Shop now →
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
