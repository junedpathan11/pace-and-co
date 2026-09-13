# Pace & Co. — Fashion + Footwear Ecommerce (Concept Demo)

A production-quality, deployable ecommerce storefront for a **fictional** modern
fashion + footwear brand, *Pace & Co.* — "Run the city." It sells clothing,
footwear **and** accessories under one roof (a fashion brand with a strong
footwear collection, not a shoe shop). Built as a freelance portfolio piece.

> **Concept demo website.** Pace & Co. is a fictional brand. No real orders are
> processed — ordering is handled via WhatsApp deep links. No payment is ever taken.

## Tech stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (design tokens via CSS variables + `@theme`)
- **No database, no auth, no backend** — static/frontend architecture
- Persistence via **localStorage** (cart, wishlist, recently viewed), hydration-safe
- State via **`useSyncExternalStore`** (tiny, dependency-free stores)
- Self-hosted fonts (**Archivo** display + **Inter** UI) via `next/font/local`
- Deploy target: **Vercel**

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build (all routes prerender static/SSG)
npm run start      # serve the production build
npm run lint       # eslint (clean)
npx tsc --noEmit   # typecheck (clean)
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values. `.env.local` is
gitignored and must never be committed.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | [Web3Forms](https://web3forms.com) access key, used by **both** the contact form and the checkout order notification. Leave as the placeholder to see the built-in "not configured" guard states. |

Both the contact form and checkout only report success when the HTTP response
is OK **and** the Web3Forms body contains `success: true` — an HTTP 200 carrying
`success: false` is treated as a failure. On failure they show the API's error
message plus a WhatsApp fallback, and checkout keeps the customer's form data
and their bag. Neither ever fakes a submission.

> Actual submission requires a real key in `.env.local`. Without one the app is
> fully usable: checkout clearly states notifications are off, the demo order,
> confirmation and invoice still work, and WhatsApp remains available.

## Project structure

```
app/                     App Router routes + layout, sitemap, robots, 404
  fonts/                 Self-hosted Archivo + Inter woff2 files
  shop/[category]/       Category pages (clothing | footwear | accessories)
  product/[slug]/        Product detail pages (SSG per product)
components/
  home/                  Home page sections (hero, marquee, tiles, rows…)
  layout/                Navbar, mobile menu, footer, demo bar, WhatsApp FAB
  shop/                  ShopClient + adaptive FilterControls
  product/               Gallery, ProductDetail, size guide, recommendations
  cart/  wishlist/       Cart drawer + full cart/wishlist views
  checkout/              Checkout view, accessible fields, order summary
  order/                 Confirmation view, printable invoice, order QR
  search/                Command-style search overlay
  ui/  seo/  providers/  Primitives, JSON-LD, global client shell
content/
  site.ts                Single typed SiteConfig (name, contact, hours, maps…)
  products.ts            Single typed product source (~33 products) + data-layer fns
  types.ts               Product / variant type definitions
lib/
  cart.ts wishlist.ts    localStorage-backed stores (versioned keys)
  filters.ts facets.ts   URL-synced filtering + adaptive facet computation
  whatsapp.ts            wa.me deep-link builder + message templates
  order.ts               Demo order model, ID generation, localStorage store
  web3forms.ts           Shared submit + strict success handling
  orderNotification.ts   Web3Forms order payload builder
  checkoutValidation.ts  Field validation (email, Indian phone/pincode)
  search.ts ui.ts …      Search, UI overlays, focus trap, mount gate
public/images/           Generated hero, category tiles, OG, product shots
```

## Architecture notes

- **Typed data layer.** All product access goes through functions in
  `content/products.ts` (`getProductBySlug`, `getProductsByType`, …). Swapping the
  in-memory array for a real API/DB later requires no component changes.
- **Product / variant model.** Each product has variant-level stock
  (`{ size, color, stock }`). A size×color combo is available only if its variant
  says so. `sizeType` (`alpha` | `numeric` | `shoe`) drives the size UI. Clothing,
  footwear and accessories carry only their relevant extra fields.
- **Cart identity is strict.** A cart line key is `productId + size + color`, so
  the same product in M/Black and L/White are two separate lines.
- **localStorage is untrusted.** Every cart read is re-resolved against the
  catalogue (`sanitizeCart`): unknown products are dropped, name/brand/image and
  **price** always come from product data, and quantities are clamped. A tampered
  or corrupted bag degrades gracefully instead of reaching checkout.
- **One pricing function.** `cartTotals()` in `lib/cart.ts` is the single source
  for subtotal / savings / delivery / total. The drawer, cart, checkout, order
  snapshot, invoice, Web3Forms payload and WhatsApp message all read from it, so
  the numbers cannot drift between screens.
- **Orders are client-side snapshots.** Placing an order freezes the purchased
  lines (name, brand, colour, size, qty, price) into a versioned localStorage
  record, so an invoice keeps showing what was actually bought even if the
  catalogue changes later. No database, no auth, no payment gateway.
- **Adaptive filters.** The filter set changes with the product type in view —
  clothing shows size/fit/material, footwear shows UK shoe size, accessories hide
  size/fit/material entirely. All filter + sort state is mirrored to URL search
  params for shareable views (e.g. `/shop?gender=men&productType=footwear&sale=true`).
- **Hydration safety.** Persisted values are never rendered during SSR; a
  mount-gate (`useMounted`) and `getServerSnapshot` returning empty keep the first
  client render in sync with the server.
- **Server-first.** Pages are Server Components; only interactive leaves
  (cards, drawers, filters, buy box) are Client Components.

## Design system

Design tokens live in `app/globals.css` as CSS variables and are mapped into
Tailwind via `@theme` — no hardcoded hex or durations in components.

- **Colours:** warm paper `#F5F4F0`, ink `#191919`, racing red `#D64045` (accent
  only — CTAs, sale prices, selected states), grey `#E5E4E0`.
- **Type:** Archivo (Expanded-feel display, uppercase, tight tracking) + Inter.
- **Radii:** cards 16px, chips/badges 999px, images 12px.
- **Motion:** 150/250/400ms ease-out — hover image swaps, heart pop, drawer
  slides, a 30s marquee, and once-only scroll reveals.

## Images

All imagery is generated locally into `public/images/` and served through
`next/image` (no hotlinked stock). Two coordinated "shoots": clean warm-grey
studio product shots and a warm-dawn urban lifestyle hero. Product files follow
`/products/{slug}-a.jpg` (main) and `-b.jpg` (alternate angle for the hover swap).

## Routes

`/` · `/shop` · `/shop/[category]` · `/product/[slug]` · `/cart` · `/checkout` ·
`/order-success/[orderId]` · `/invoice/[orderId]` · `/wishlist` · `/offers` ·
`/about` · `/contact` · custom `404`.

Checkout is intentionally **not** in the navbar — it's reached from the cart,
and the order/invoice routes are `noindex` since they're personal and local-only.

## Demo checkout flow

```
Product → Add to cart → Cart → Checkout → Order confirmation → Invoice
                          └──── or Order via WhatsApp (unchanged) ────┘
```

- **`/checkout`** — customer details + Indian delivery address with accessible
  validation (`aria-invalid`, `aria-describedby`, `autocomplete`, visible errors,
  ≥44px targets), a standard-delivery line and a sticky order summary. Payment is
  **Cash on Delivery** or **confirm on WhatsApp** — there is no gateway and no
  card data is ever collected.
- **Placing an order** posts the details to Web3Forms, then creates a demo order
  (`PC-YYYYMMDD-NNNN`) and invoice (`INV-PC-…`) and clears the bag. If the
  notification fails, no order is created, the bag and form are preserved, and
  WhatsApp is offered as a fallback.
- **`/invoice/[orderId]`** — a print-friendly invoice with an **order-reference
  QR code** (via `qrcode.react`). The QR encodes the order/invoice numbers,
  amount and status so staff can identify the order; it is explicitly *not* a
  payment code. "Print / Save as PDF" uses `window.print()` with a dedicated
  `@media print` block that strips the navbar, footer and all buttons.

> No payment is ever processed. Order status stays *Pending confirmation* —
> the UI never claims money changed hands.

## SEO & accessibility

- Per-page + per-product metadata, Product / LocalBusiness / BreadcrumbList
  JSON-LD, generated OG image, `sitemap.xml`, `robots.txt`.
- Semantic HTML, one `h1` per page, labelled controls, visible focus rings,
  true modal pattern (focus trap + Esc + focus restore) for drawers, search,
  size guide and lightbox, ≥44px touch targets, full keyboard shopping flow.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project in Vercel (framework auto-detected as Next.js).
3. Add `NEXT_PUBLIC_WEB3FORMS_KEY` in Project → Settings → Environment Variables
   (optional — the site works without it; the contact form shows its guard state).
4. Deploy.

---

© 2026 Pace & Co. — Concept demo website. Fictional brand for portfolio use.
