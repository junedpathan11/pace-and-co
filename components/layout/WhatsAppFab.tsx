import { buildWhatsAppLink, questionMessage } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";

export default function WhatsAppFab() {
  return (
    <a
      href={buildWhatsAppLink(questionMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-chip bg-primary text-white shadow-[var(--shadow-lift)] transition-transform duration-[var(--anim-base)] hover:scale-105"
    >
      <WhatsAppIcon />
    </a>
  );
}
