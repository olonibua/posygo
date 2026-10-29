import type { ProductInput } from "@/shared";

import { productCodeFix, tariffCodeFix } from "@/features/assistant/guidance/fixes";
import { describePage, type PageKnowledgeOf } from "@/features/assistant/knowledge/types";

const PRODUCT: Omit<PageKnowledgeOf<ProductInput>, "route"> = {
  title: "Add a product",
  purpose: "Describe a product once, so the hub can recognise it, store it in the right box size and pack it into orders.",
  steps: [
    "Give it a name and your own product code.",
    "Add where it's made, what one unit is worth and its tariff code, which customs may ask for when you send stock into a country.",
    "Enter its weight and, if you know them, its size.",
    "Pick the box size it's usually stored in.",
    "Add barcodes if it has them, and a photo so the hub can spot it.",
  ],
  fields: {
    name: { labels: ["Product name"], meaning: "The name you and your customers know it by.", example: "Body wave wig, 16 inch" },
    code: {
      labels: ["Product code"],
      meaning: "Your own short code for this product. It appears on labels and in orders, and must be unique in your catalogue.",
      example: "WIG-BW-16",
      mistakes: ["Use 2 to 40 letters, numbers or dashes; no spaces."],
      fix: productCodeFix,
    },
    variantLabel: { labels: ["Variant"], meaning: "What makes this version different from others with the same name, like a size or colour. Optional.", example: "16 inch, natural black" },
    countryOfOrigin: { labels: ["Made in"], meaning: "The country where the product was made. Customs may ask for it when you send stock into a country." },
    declaredValueMinor: {
      labels: [/^Value per unit/],
      meaning: "What one unit is worth. It's used for customs when you send stock in, and for insurance while it's stored.",
      mistakes: ["Use the value of one unit, not the whole shipment."],
    },
    hsCode: {
      labels: ["Tariff code"],
      meaning: "The 6 to 10 digit customs code for the type of product, also called an HS code. Customs may ask for it when you send stock into a country. Optional.",
      example: "670420",
      mistakes: ["Digits only, without dots or spaces."],
      fix: tariffCodeFix,
    },
    weightGrams: { labels: [/^Weight/], meaning: "The weight of one unit in its packaging. It's used to price shipping." },
    lengthMm: { labels: [/^Length/], meaning: "The length of one packed unit. Give all three sizes or none. They are optional, but with them we can show you delivery prices from couriers while you create an order." },
    widthMm: { labels: [/^Width/], meaning: "The width of one packed unit. Give all three sizes or none." },
    heightMm: { labels: [/^Height/], meaning: "The height of one packed unit. Give all three sizes or none." },
    storageTier: {
      labels: ["Storage size"],
      meaning: "The box size this product is usually stored in. It sets the storage price. Small fits up to a shoebox, medium a moving box, large a wardrobe box.",
    },
    imageFileId: { labels: ["Product photo", "Choose file"], meaning: "A clear photo of the product, so the hub can recognise it when picking orders. Optional." },
    barcodes: {
      labels: [/^Barcode \d+$/, "Type"],
      meaning: "Barcodes printed on the product, like EAN-13 or UPC-A. The hub scans them. If you have none, we print labels from your product code.",
      mistakes: ["EAN-13, UPC-A and GTIN-14 barcodes have a check digit; a typo usually breaks it.", "The same barcode can't be added twice."],
    },
  },
  related: [
    { href: "/products", label: "Your products" },
    { href: "/inbound/new", label: "Send stock in" },
  ],
};

export const NEW_PRODUCT_KNOWLEDGE = describePage<ProductInput>({ ...PRODUCT, route: "/products/new" });
export const PRODUCT_KNOWLEDGE = describePage<ProductInput>({ ...PRODUCT, route: "/products/[id]", title: "Product details" });
