import { describePage } from "@/features/assistant/knowledge/types";

export const PRODUCTS_KNOWLEDGE = describePage<Record<"status" | "select", unknown>>({
  route: "/products",
  title: "Your products",
  purpose: "Your catalogue: every product you can send to a hub, with its storage size and how many units are available or damaged.",
  steps: [
    "Add each product before you send it in, so you can list it on a stock shipment.",
    "Switch between active and archived products.",
    "Open a product to see its details.",
    "Tick products and choose Print labels to print barcode labels for them.",
  ],
  fields: {
    status: { labels: ["Filter products"], meaning: "Shows your active products or the ones you've archived. Only active products can be added to a stock shipment." },
    select: { labels: [/^Select .+ for labels$/], meaning: "Tick the products you want labels for, then choose Print labels." },
  },
  related: [
    { href: "/products/new", label: "Add a product" },
    { href: "/inbound/new", label: "Send stock in" },
    { href: "/inventory", label: "Your stock" },
  ],
});

export const PRODUCT_LABELS_KNOWLEDGE = describePage<Record<"copies", unknown>>({
  route: "/products/labels",
  title: "Product labels",
  purpose: "Print barcode labels to stick on every unit before it ships, so the hub can scan it on arrival.",
  steps: ["Pick products on the Products page, then choose Print labels.", "Choose how many copies of each label you need.", "Choose Print labels and stick one on every unit."],
  fields: { copies: { labels: ["Copies of each"], meaning: "How many labels to print for each product you picked: 1, 2, 5, 10, 20 or 50." } },
  related: [
    { href: "/products", label: "Your products" },
    { href: "/inbound/new", label: "Send stock in" },
  ],
});
