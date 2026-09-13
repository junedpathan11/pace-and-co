import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DemoBar from "@/components/layout/DemoBar";
import WhatsAppFab from "@/components/layout/WhatsAppFab";
import { StoreProvider } from "@/components/providers/StoreProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchOverlay from "@/components/search/SearchOverlay";
import { LocalBusinessSchema } from "@/components/seo/JsonLd";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const siteUrl = "https://pace-and-co.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Pace & Co. is a modern fashion and footwear brand — clothing, sneakers, and accessories built to run the city. Shop the new drop.",
  keywords: [
    "fashion",
    "footwear",
    "sneakers",
    "clothing",
    "accessories",
    "Pace & Co",
    "Ahmedabad",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description:
      "Modern fashion and footwear under one roof. Clothing, sneakers, and accessories built to run the city.",
    url: siteUrl,
    siteName: site.name,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: "Modern fashion and footwear built to run the city.",
    images: ["/images/og.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <LocalBusinessSchema />
        <StoreProvider>
          <DemoBar />
          <Navbar />
          <SearchOverlay />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFab />
        </StoreProvider>
      </body>
    </html>
  );
}
