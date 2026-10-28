export interface Guide {
  slug: string;
  title: string;
  description: string;
  updated: string;
  sections: ReadonlyArray<{ heading: string; paragraphs: readonly string[] }>;
  related: ReadonlyArray<{ href: string; label: string }>;
}

export const GUIDES: readonly Guide[] = [
  {
    slug: "sell-abroad-without-a-warehouse",
    title: "How to sell in another country without your own warehouse",
    description: "A plain guide to faster delivery abroad: keep your stock closer to your customers so every order reaches them in days instead of weeks.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Why shipping every order from home is slow and costly",
        paragraphs: [
          "When every order crosses a border on its own, each one pays international postage, waits in customs and takes weeks to arrive. Customers notice, and returns become expensive.",
          "Keeping your stock in the country you sell to flips this. You send your stock in bulk once, and each order then makes only a short trip to your customer.",
        ],
      },
      {
        heading: "What we do with your stock",
        paragraphs: [
          "We receive your boxes, count every unit and photograph each arrival. We store your stock, and when an order comes in we pick the items, pack them, photograph the sealed parcel and send it with tracking.",
          "You see every box from the moment you declare it to the moment it's counted, and every order from packing to delivery.",
        ],
      },
      {
        heading: "The steps to get started",
        paragraphs: [
          "Create a seller account and choose the country you sell to. Add your products with their weights and sizes. Tell us what you're sending and we give you the address to send it to.",
          "Once your boxes are counted, your stock is ready to sell. Orders can come from your own shop, a spreadsheet upload or your Posygo storefront.",
        ],
      },
      {
        heading: "What you pay",
        paragraphs: [
          "There's no subscription. You pay a one-off stocking fee and monthly storage per box, a fee per order packed, and shipping at the carrier's price plus a small markup. Prices for each country are on our pricing page.",
        ],
      },
    ],
    related: [
      { href: "/pricing", label: "Prices by country" },
      { href: "/how-it-works", label: "How Posygo works" },
    ],
  },
  {
    slug: "fulfilment-costs-explained",
    title: "Fulfilment costs explained: stocking, storage, packing and shipping",
    description: "What each fulfilment fee is for, how storage per box works, and how to estimate your monthly cost before you send any stock.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Stocking: paid once when a box arrives",
        paragraphs: [
          "When your box arrives it's opened, every unit is counted and the arrival is photographed. The stocking fee covers that work and is charged once per box, together with that box's first month of storage. In some countries your first shipment's stocking fee is waived.",
        ],
      },
      {
        heading: "Storage: per box, by size, each month",
        paragraphs: [
          "Storage is charged per box rather than per shelf or per square metre, so you pay for the space your stock actually takes. Boxes come in sizes from small to pallet, and the largest are priced by quote.",
          "Storage is billed at the start of each month for every box we're holding for you. Selling through stock faster lowers this cost.",
        ],
      },
      {
        heading: "Packing: per order",
        paragraphs: ["Each order has a base packing fee that covers the first unit, plus a small fee for each extra unit, up to a cap. A large order never costs more to pack than the cap."],
      },
      {
        heading: "Shipping and returns",
        paragraphs: [
          "Shipping is charged at the carrier's price plus a small percentage. Returns that come back to us have a fixed handling fee for checking the item and putting it back into stock or setting it aside.",
        ],
      },
      {
        heading: "How you pay",
        paragraphs: ["You top up a wallet in the local currency. Fees are taken as the work is done, and every charge is listed with what it was for, so there are no surprise invoices."],
      },
    ],
    related: [
      { href: "/pricing", label: "See current prices" },
      { href: "/signup", label: "Create a seller account" },
    ],
  },
  {
    slug: "keeping-your-stock-safe",
    title: "How we keep your stock safe",
    description: "How Posygo protects a seller's stock: every unit counted, every parcel photographed, regular stock checks and insurance while we hold it.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Counted and photographed on arrival",
        paragraphs: ["Every box is opened, every unit is counted and the arrival is photographed, so you know exactly what you have before you sell it."],
      },
      {
        heading: "Evidence at every step",
        paragraphs: [
          "Every parcel is photographed sealed before it leaves and sent with tracking. You can see every box and every order in your account at any time.",
          "We also run surprise stock counts and test orders to check that everything is where it should be.",
        ],
      },
      {
        heading: "Insured while we hold it",
        paragraphs: [
          "Your stock is insured while we hold it. If something is lost or damaged, the photos and the record of every movement make the claim quick to settle, and approved claims are credited to your wallet.",
        ],
      },
    ],
    related: [
      { href: "/how-it-works", label: "How Posygo works" },
      { href: "/pricing", label: "Prices by country" },
    ],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
