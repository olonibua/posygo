import { BRAND } from "./brand";

export const WHATSAPP_GREETING = "Hi Posygo, I sell online and I'd like to know more about storing my stock closer to my customers.";

export function whatsappLink(message: string = WHATSAPP_GREETING): string {
  return `https://wa.me/${BRAND.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
