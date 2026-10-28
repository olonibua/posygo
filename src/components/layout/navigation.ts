import { hasPermission, type Permission, type SessionUser } from "@/shared";

import type { IconName } from "@/components/ui/icon";
import type { Tone } from "@/components/ui/tone";
import { type Feature, FEATURES } from "@/lib/features";

export interface NavItem {
  label: string;
  icon: IconName;
  tone: Tone;
  group: string;
  href?: string;
  permission?: Permission;
  operational?: boolean;
  holdsStock?: boolean;
  feature?: Feature;
  openBeforeLive?: boolean;
}

const HOLDING_STOCK: ReadonlyArray<SessionUser["partnerStatus"]> = ["ACTIVE", "SUSPENDED", "OFFBOARDING"];

export interface Console {
  label: string;
  stamp: string;
  items: readonly NavItem[];
}

export const VENDOR_CONSOLE: Console = {
  label: "Vendor portal",
  stamp: "Inventory & fulfilment",
  items: [
    { label: "Overview", icon: "overview", tone: "orange", group: "Start here", href: "/overview", openBeforeLive: true },
    { label: "Verification", icon: "verification", tone: "lime", group: "Start here", href: "/verification", openBeforeLive: true },
    { label: "Products", icon: "products", tone: "sky", group: "Stock", href: "/products", permission: "vendor.stock.read" },
    { label: "Inventory", icon: "inventory", tone: "yellow", group: "Stock", href: "/inventory", permission: "vendor.stock.read" },
    { label: "Inbound", icon: "inbound", tone: "pink", group: "Stock", href: "/inbound", permission: "vendor.stock.read" },
    { label: "Orders", icon: "orders", tone: "blue", group: "Sell", href: "/orders", permission: "vendor.orders.read" },
    { label: "Storefront", icon: "storefront", tone: "teal", group: "Sell", href: "/storefront", permission: "vendor.stock.read", feature: "marketplace" },
    { label: "Returns", icon: "returns", tone: "magenta", group: "Sell", href: "/returns", permission: "vendor.orders.read" },
    { label: "Claims", icon: "claim", tone: "pink", group: "Sell", href: "/claims", permission: "vendor.orders.read" },
    { label: "Wallet", icon: "wallet", tone: "lime", group: "Money", href: "/wallet", permission: "vendor.wallet.read" },
    { label: "Team", icon: "team", tone: "orange", group: "Settings", href: "/settings/team", permission: "vendor.team.read" },
    { label: "Countries", icon: "globe", tone: "sky", group: "Settings", href: "/settings/markets" },
    { label: "Integrations", icon: "settings", tone: "yellow", group: "Settings", href: "/settings/integrations", permission: "vendor.integrations.manage" },
    { label: "Refer a business", icon: "team", tone: "lime", group: "Settings", href: "/settings/referrals", permission: "vendor.portal.access" },
    { label: "Security", icon: "shield", tone: "pink", group: "Settings", href: "/settings/security", openBeforeLive: true },
  ],
};

export const ADMIN_CONSOLE: Console = {
  label: "Platform console",
  stamp: "Network oversight",
  items: [
    { label: "Overview", icon: "overview", tone: "orange", group: "Network", href: "/admin" },
    { label: "Countries", icon: "globe", tone: "sky", group: "Network", href: "/admin/countries", permission: "countries.read" },
    { label: "Partners", icon: "lanes", tone: "lime", group: "Network", href: "/admin/partners", permission: "partners.read" },
    { label: "Vendors", icon: "team", tone: "pink", group: "Network", href: "/admin/vendors", permission: "vendors.read" },
    { label: "Warehouses", icon: "storefront", tone: "yellow", group: "Network", href: "/admin/warehouses", permission: "warehouses.read" },
    { label: "Receiving", icon: "inbound", tone: "pink", group: "Operations", href: "/admin/receiving", permission: "inbound.read" },
    { label: "Orders", icon: "orders", tone: "blue", group: "Operations", href: "/admin/orders", permission: "orders.read" },
    { label: "Returns", icon: "returns", tone: "magenta", group: "Operations", href: "/admin/returns", permission: "inbound.read" },
    { label: "Shopping parcels", icon: "inbound", tone: "lime", group: "Operations", href: "/admin/shopping-desk", permission: "inbound.read", feature: "personalShopping" },
    { label: "Packaging", icon: "products", tone: "teal", group: "Operations", href: "/admin/packaging", permission: "orders.read" },
    { label: "Products", icon: "products", tone: "sky", group: "Operations", href: "/admin/products", permission: "vendors.read" },
    { label: "Stock", icon: "inventory", tone: "yellow", group: "Operations", href: "/admin/stock", permission: "inventory.read" },
    { label: "Transfers", icon: "transfer", tone: "orange", group: "Operations", href: "/admin/transfers", permission: "transfers.manage" },
    { label: "Hub transfers", icon: "transfer", tone: "orange", group: "Operations", href: "/admin/hub-transfers", permission: "inbound.receive" },
    { label: "Claims", icon: "claim", tone: "pink", group: "Trust", href: "/admin/claims", permission: "claims.read" },
    { label: "Custody alerts", icon: "bell", tone: "yellow", group: "Trust", href: "/admin/custody-alerts", permission: "claims.read" },
    { label: "Verifications", icon: "verification", tone: "lime", group: "Trust", href: "/admin/verifications", permission: "verifications.read" },
    { label: "Support cases", icon: "bell", tone: "pink", group: "Trust", href: "/admin/support", permission: "support.read" },
    { label: "Legal", icon: "document", tone: "sky", group: "Trust", href: "/admin/legal", permission: "legal.manage" },
    { label: "Audit log", icon: "document", tone: "magenta", group: "Trust", permission: "audit.read" },
    { label: "Finance", icon: "wallet", tone: "orange", group: "Money", href: "/admin/finance", permission: "finance.read" },
    { label: "Store orders", icon: "storefront", tone: "lime", group: "Money", href: "/admin/storefront-orders", permission: "storefronts.read", feature: "marketplace" },
    { label: "Store returns", icon: "inbound", tone: "pink", group: "Money", href: "/admin/storefront-returns", permission: "storefronts.read", feature: "marketplace" },
    { label: "Personal shopping", icon: "storefront", tone: "yellow", group: "Money", href: "/admin/shopping", permission: "shopping.read", feature: "personalShopping" },
    { label: "Referrals", icon: "team", tone: "lime", group: "Money", href: "/admin/referrals", permission: "referrals.read" },
    { label: "Prices", icon: "document", tone: "pink", group: "Money", href: "/admin/fees", permission: "fees.read" },
    { label: "Staff", icon: "team", tone: "sky", group: "People", href: "/admin/staff", permission: "staff.manage" },
    { label: "Security", icon: "shield", tone: "lime", group: "People", href: "/admin/security" },
  ],
};

export const PARTNER_CONSOLE: Console = {
  label: "Partner console",
  stamp: "Fulfilment partner",
  items: [
    { label: "Partnership", icon: "overview", tone: "orange", group: "Your hub", href: "/admin/partnership", permission: "partner.profile.read" },
    { label: "Receiving", icon: "inbound", tone: "pink", group: "Your hub", href: "/admin/receiving", permission: "inbound.read", operational: true },
    { label: "Orders", icon: "orders", tone: "blue", group: "Your hub", href: "/admin/orders", permission: "orders.read", operational: true },
    { label: "Returns", icon: "returns", tone: "magenta", group: "Your hub", href: "/admin/returns", permission: "inbound.read", operational: true },
    { label: "Shopping parcels", icon: "inbound", tone: "lime", group: "Your hub", href: "/admin/shopping-desk", permission: "inbound.read", operational: true, feature: "personalShopping" },
    { label: "Stock", icon: "inventory", tone: "yellow", group: "Your hub", href: "/admin/stock", permission: "inventory.read", operational: true },
    { label: "Stock counts", icon: "verification", tone: "lime", group: "Your hub", href: "/admin/partnership/stock-counts", permission: "partner.profile.read", holdsStock: true },
    { label: "Transfers", icon: "transfer", tone: "orange", group: "Your hub", href: "/admin/partnership/transfers", permission: "partner.profile.read", holdsStock: true },
    { label: "Hub", icon: "storefront", tone: "teal", group: "Your hub", href: "/admin/warehouses", permission: "warehouses.read", operational: true },
    { label: "Team", icon: "team", tone: "sky", group: "You", href: "/admin/partnership/team", permission: "partner.team.manage" },
    { label: "Earnings", icon: "wallet", tone: "lime", group: "You", href: "/admin/partnership/earnings", permission: "partner.statement.read" },
    { label: "Claims", icon: "claim", tone: "pink", group: "You", href: "/admin/partnership/claims", permission: "partner.statement.read", holdsStock: true },
    { label: "Security", icon: "shield", tone: "pink", group: "You", href: "/admin/security" },
  ],
};

export function consoleFor(user: SessionUser): Console {
  return user.partnerId ? PARTNER_CONSOLE : ADMIN_CONSOLE;
}

export function visibleItems(console: Console, user: SessionUser): NavItem[] {
  const operating = !user.partnerId || user.partnerStatus === "ACTIVE";
  const holding = !user.partnerId || HOLDING_STOCK.includes(user.partnerStatus);
  return console.items.filter(
    (item) => (!item.permission || hasPermission(user.role, item.permission)) && (operating || !item.operational) && (holding || !item.holdsStock) && (!item.feature || FEATURES[item.feature]),
  );
}

export function isLocked(item: NavItem, user: SessionUser): boolean {
  return user.vendorId !== null && user.vendorStatus !== "ACTIVE" && !item.openBeforeLive;
}

export function activeItem(items: readonly NavItem[], pathname: string): NavItem | undefined {
  return items.filter((item) => item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`))).sort((first, second) => (second.href?.length ?? 0) - (first.href?.length ?? 0))[0];
}
