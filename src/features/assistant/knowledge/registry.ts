import * as AuthPages from "@/features/auth/auth-pages.knowledge";
import * as Signup from "@/features/auth/signup.knowledge";
import * as CataloguePages from "@/features/catalogue/catalogue-pages.knowledge";
import * as Product from "@/features/catalogue/product.knowledge";
import * as Countries from "@/features/countries/countries.knowledge";
import * as VendorClaims from "@/features/custody/claims.knowledge";
import * as Custody from "@/features/custody/custody.knowledge";
import * as ReportProblem from "@/features/custody/report-problem.knowledge";
import * as FinanceAdmin from "@/features/finance/finance-admin.knowledge";
import * as SandboxCheckout from "@/features/finance/sandbox-checkout.knowledge";
import * as Wallet from "@/features/finance/wallet.knowledge";
import * as Fulfilment from "@/features/fulfilment/fulfilment.knowledge";
import * as ReferralsAdmin from "@/features/growth/referrals-admin.knowledge";
import * as Referrals from "@/features/growth/referrals.knowledge";
import * as InboundPages from "@/features/inbound/inbound-pages.knowledge";
import * as Inbound from "@/features/inbound/inbound.knowledge";
import * as Inventory from "@/features/inventory/inventory.knowledge";
import * as Marketing from "@/features/marketing/marketing.knowledge";
import * as Onboarding from "@/features/onboarding/onboarding.knowledge";
import * as OrderPages from "@/features/orders/order-pages.knowledge";
import * as Order from "@/features/orders/order.knowledge";
import * as ConsoleOverview from "@/features/overview/console-overview.knowledge";
import * as Overview from "@/features/overview/overview.knowledge";
import * as PartnerConsole from "@/features/partners/partner-console.knowledge";
import * as PartnersAdmin from "@/features/partners/partners-admin.knowledge";
import * as Receiving from "@/features/receiving/receiving.knowledge";
import * as Returns from "@/features/returns/returns.knowledge";
import * as WarehouseReturns from "@/features/returns/warehouse-returns.knowledge";
import * as Review from "@/features/review/review.knowledge";
import * as Security from "@/features/security/security.knowledge";
import * as ShoppingAdmin from "@/features/shopping/shopping-admin.knowledge";
import * as Shopping from "@/features/shopping/shopping.knowledge";
import * as Staff from "@/features/staff/staff.knowledge";
import * as StorefrontAdmin from "@/features/storefront/admin/storefront-admin.knowledge";
import * as Storefront from "@/features/storefront/storefront.knowledge";
import * as VendorStorefront from "@/features/storefront/vendor/storefront.knowledge";
import * as Support from "@/features/support/support.knowledge";
import * as Tracking from "@/features/tracking/tracking.knowledge";
import * as Warehouses from "@/features/warehouses/warehouses.knowledge";

import { type PageKnowledge, routeMatches } from "./types";

const SOURCES: ReadonlyArray<Record<string, unknown>> = [
  AuthPages,
  Signup,
  CataloguePages,
  Product,
  Countries,
  VendorClaims,
  Custody,
  ReportProblem,
  FinanceAdmin,
  SandboxCheckout,
  Wallet,
  Fulfilment,
  ReferralsAdmin,
  Referrals,
  InboundPages,
  Inbound,
  Inventory,
  Marketing,
  Onboarding,
  OrderPages,
  Order,
  ConsoleOverview,
  Overview,
  PartnerConsole,
  PartnersAdmin,
  Receiving,
  Returns,
  WarehouseReturns,
  Review,
  Security,
  ShoppingAdmin,
  Shopping,
  Staff,
  StorefrontAdmin,
  Storefront,
  VendorStorefront,
  Support,
  Tracking,
  Warehouses,
];

function isPage(value: unknown): value is PageKnowledge {
  const page = value as Partial<PageKnowledge> | null;
  return typeof page?.route === "string" && typeof page.purpose === "string" && Array.isArray(page.steps);
}

export const PAGE_KNOWLEDGE: readonly PageKnowledge[] = SOURCES.flatMap((source) => Object.values(source).filter(isPage));

function specificity(route: string): number {
  return route.split("/").filter((part) => part && !part.startsWith("[")).length;
}

export function knowledgeFor(pathname: string): PageKnowledge | undefined {
  return PAGE_KNOWLEDGE.filter((page) => routeMatches(page.route, pathname)).sort((a, b) => specificity(b.route) - specificity(a.route))[0];
}
