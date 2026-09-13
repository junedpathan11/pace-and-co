import type { Metadata } from "next";
import { site } from "@/content/site";
import ContactForm from "@/components/contact/ContactForm";
import { buildWhatsAppLink, questionMessage } from "@/lib/whatsapp";
import {
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Pace & Co. — visit our Ahmedabad store, call us, message on WhatsApp, or send a message.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="mb-8">
        <p className="eyebrow">Say hello</p>
        <h1 className="display-section mt-2">Get in touch</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Form */}
        <div>
          <h2 className="eyebrow mb-4">Send a message</h2>
          <ContactForm />
        </div>

        {/* Details */}
        <div>
          <h2 className="eyebrow mb-4">Other ways to reach us</h2>
          <div className="space-y-3">
            <a
              href={buildWhatsAppLink(questionMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-card bg-grey p-4 hover:bg-border"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-chip bg-primary text-white">
                <WhatsAppIcon width={22} height={22} />
              </span>
              <div>
                <p className="text-sm font-semibold">WhatsApp</p>
                <p className="text-xs text-muted">{site.whatsapp.display}</p>
              </div>
            </a>
            <a
              href={site.phoneHref}
              className="flex items-center gap-3 rounded-card bg-grey p-4 hover:bg-border"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-chip bg-surface text-ink">
                <PhoneIcon width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Call us</p>
                <p className="text-xs text-muted">{site.phone}</p>
              </div>
            </a>
            <div className="flex items-start gap-3 rounded-card bg-grey p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-chip bg-surface text-ink">
                <MapPinIcon width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Visit the store</p>
                <p className="text-xs text-muted">{site.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-card bg-grey p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-chip bg-surface text-ink">
                <ClockIcon width={20} height={20} />
              </span>
              <div>
                <p className="text-sm font-semibold">Opening hours</p>
                <p className="text-xs text-muted">{site.hours}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-card border border-border">
            <iframe
              src={site.mapsEmbed}
              title="Pace & Co. store location"
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
