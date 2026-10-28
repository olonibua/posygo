import type { ProductDirectoryQuery, VendorDirectoryQuery } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const VENDORS_KNOWLEDGE = describePage<Pick<VendorDirectoryQuery, "q" | "country">>({
  route: "/admin/vendors",
  title: "Vendors",
  purpose: "Every business that has signed up, including those who haven't confirmed their email or finished verification yet. Country staff only see their own country.",
  steps: [
    "Pick a stage to narrow the list. Signed up means they haven't started verification; Verifying means it's open or sent back; Verified means approved but not trading yet; Live means they can trade.",
    "Search by business name or the owner's email.",
    "Open a vendor to see their team, verification dates, markets, wallet and products.",
  ],
  fields: {
    q: { labels: ["Search vendors"], meaning: "Finds vendors whose business name or owner's email contains what you type. Part of a name or email is enough." },
    country: { labels: ["Country"], meaning: "Shows only vendors based in this country. Leave it on All countries to see everyone." },
  },
  related: [
    { href: "/admin/products", label: "Products" },
    { href: "/admin/verifications", label: "Business verifications" },
  ],
});

export const VENDOR_KNOWLEDGE = describePage({
  route: "/admin/vendors/[id]",
  title: "Vendor",
  purpose: "One business at a glance: its stage, team, verification dates, the markets it sells to, wallet balance and every product it has added.",
  steps: [
    "Check the stage and verification status at the top to see how far the business has got.",
    "Look at the team to see who has an account and whether they've confirmed their email.",
    "Scroll to Products to see what they've added, who added each one and where its stock is.",
  ],
  fields: {},
  related: [
    { href: "/admin/vendors", label: "All vendors" },
    { href: "/admin/products", label: "Products" },
  ],
});

export const PRODUCTS_KNOWLEDGE = describePage<Pick<ProductDirectoryQuery, "q">>({
  route: "/admin/products",
  title: "Products",
  purpose: "Every product vendors have added, across all businesses, with who added it and where its stock is. Country staff only see products from their own country's vendors.",
  steps: [
    "Pick a stock filter. Not sent yet means no stock has been sent in; On the way means a shipment is declared but not counted; In storage means units are on the shelf; Sold out means stock came in and has all gone.",
    "Search by product name or code.",
    "Select a vendor's name to open that business.",
  ],
  fields: {
    q: { labels: ["Search products"], meaning: "Finds products whose name or code contains what you type. Part of a name or code is enough." },
  },
  related: [
    { href: "/admin/vendors", label: "Vendors" },
    { href: "/admin/stock", label: "Stock" },
  ],
});
