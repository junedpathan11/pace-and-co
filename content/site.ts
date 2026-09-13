export interface SocialLink {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  wordmark: string;
  tagline: string;
  businessType: string;
  description: string;
  phone: string;
  phoneHref: string;
  email: string;
  whatsapp: { number: string; display: string };
  address: string;
  addressShort: string;
  hours: string;
  mapsEmbed: string;
  mapsLink: string;
  socials: SocialLink[];
  demoLabel: string;
  announcement: string;
  freeDeliveryThreshold: number;
}

export const site: SiteConfig = {
  name: "Pace & Co.",
  wordmark: "PACE&CO.",
  tagline: "Run the city.",
  businessType: "Fashion & Footwear",
  description:
    "A modern fashion and footwear brand — clothing, sneakers, and accessories under one roof.",
  phone: "+91 90000 00000",
  phoneHref: "tel:+919000000000",
  email: "hello@paceandco.example",
  whatsapp: { number: "919000000000", display: "+91 90000 00000" },
  address:
    "Shop 4-5, Iscon Emporio, SG Highway, Ahmedabad, Gujarat 380015",
  addressShort: "Iscon Emporio, SG Highway, Ahmedabad",
  hours: "Mon–Sun 10:30–21:30",
  // Real-format Google Maps embed for the SG Highway / Ahmedabad area.
  mapsEmbed:
    "https://www.google.com/maps?q=Iscon+Emporio+SG+Highway+Ahmedabad&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Iscon+Emporio+SG+Highway+Ahmedabad",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Facebook", href: "https://facebook.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
  ],
  demoLabel: "Concept demo website",
  announcement: "Free delivery above ₹2,999 · Free size exchange",
  freeDeliveryThreshold: 2999,
};
