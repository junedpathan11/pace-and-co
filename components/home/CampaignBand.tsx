import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function CampaignBand() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-card">
          <div className="relative aspect-[16/9] w-full md:aspect-[21/9]">
            <Image
              src="/images/hero.jpg"
              alt="Monsoon edit campaign"
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-ink/40" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center p-6 text-white md:p-12">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-white/80">
              Limited time
            </p>
            <h2 className="display-section mt-2 max-w-lg">
              Monsoon edit: up to 40% off
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/85">
              Water-ready shells, quick-dry layers and grippy footwear — marked
              down while the season lasts.
            </p>
            <div className="mt-6">
              <Link href="/offers" className="btn btn-red">
                Shop the sale
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
