import { formatCFA } from "@/lib/format";

/** Numéro WhatsApp de la boutique (Sénégal) */
export const WHATSAPP_NUMBER = "221765779574";
export const WHATSAPP_DISPLAY = "+221 76 577 95 74";

export function whatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(message: string) {
  window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
}

type Line = { name: string; quantity: number; price: number };

export function buildOrderMessage(items: Line[], total?: number) {
  const lines = items
    .map((i, n) => `${n + 1}. ${i.name} — x${i.quantity} — ${formatCFA(i.price * i.quantity)}`)
    .join("\n");
  const sum = total ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  return [
    "Bonjour ElectroMaison 👋",
    "Je souhaite commander :",
    lines,
    `Total : ${formatCFA(sum)}`,
    "",
    "Merci de me confirmer la disponibilité et la livraison.",
  ].join("\n");
}
