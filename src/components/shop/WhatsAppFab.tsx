import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappUrl("Bonjour ElectroMaison 👋, j'ai une question sur un produit.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-elevated transition hover:brightness-95"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">Commander sur WhatsApp</span>
    </a>
  );
}
