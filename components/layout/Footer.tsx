import Link from "next/link";
import { site } from "@/content/site";
import { buildWhatsAppLink, questionMessage } from "@/lib/whatsapp";

const shopLinks = [
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Clothing", href: "/shop/clothing" },
  { label: "Footwear", href: "/shop/footwear" },
  { label: "Accessories", href: "/shop/accessories" },
  { label: "Sale", href: "/offers" },
];

const helpLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Shop All", href: "/shop" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      {/* Footer CTA */}
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center">
          <div>
            <h2 className="display-section text-ink">Run the city.</h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              Fashion, footwear and accessories built for people who keep moving.
              Message us to order — we&apos;ll take it from there on WhatsApp.
            </p>
          </div>
          <a
            href={buildWhatsAppLink(questionMessage())}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red shrink-0"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-xl font-extrabold text-ink">
            {site.wordmark}
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">{site.description}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-wider text-muted hover:text-ink"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-4">Shop</p>
          <ul className="space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Help</p>
          <ul className="space-y-2.5">
            {helpLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-muted hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <p className="eyebrow mb-4">Visit &amp; Contact</p>
          <address className="space-y-2.5 not-italic text-sm text-muted">
            <p>{site.address}</p>
            <p>{site.hours}</p>
            <a href={site.phoneHref} className="block hover:text-ink">
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="block hover:text-ink">
              {site.email}
            </a>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-4 py-5 text-[0.6875rem] uppercase tracking-[0.14em] text-muted md:flex-row">
          <p>© 2026 {site.name}</p>
          <p>{site.demoLabel} · Fictional brand for portfolio</p>
        </div>
      </div>
    </footer>
  );
}
