import { SIGNUP_KNOWLEDGE } from "@/features/auth/signup.knowledge";
import { NEW_PRODUCT_KNOWLEDGE, PRODUCT_KNOWLEDGE } from "@/features/catalogue/product.knowledge";
import { WALLET_KNOWLEDGE } from "@/features/finance/wallet.knowledge";
import { EDIT_SHIPMENT_KNOWLEDGE, NEW_SHIPMENT_KNOWLEDGE } from "@/features/inbound/inbound.knowledge";
import { NEW_ORDER_KNOWLEDGE } from "@/features/orders/order.knowledge";

import { type PageKnowledge, routeMatches } from "./types";

export const PAGE_KNOWLEDGE: readonly PageKnowledge[] = [
  SIGNUP_KNOWLEDGE,
  NEW_SHIPMENT_KNOWLEDGE,
  EDIT_SHIPMENT_KNOWLEDGE,
  NEW_PRODUCT_KNOWLEDGE,
  PRODUCT_KNOWLEDGE,
  NEW_ORDER_KNOWLEDGE,
  WALLET_KNOWLEDGE,
];

function specificity(route: string): number {
  return route.split("/").filter((part) => part && !part.startsWith("[")).length;
}

export function knowledgeFor(pathname: string): PageKnowledge | undefined {
  return PAGE_KNOWLEDGE.filter((page) => routeMatches(page.route, pathname)).sort((a, b) => specificity(b.route) - specificity(a.route))[0];
}
