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
    description: "A plain guide to selling abroad with local fulfilment: where your stock lives, how orders get packed and how customers get them in days instead of weeks.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Why shipping every order from home is slow and costly",
        paragraphs: [
          "When every order crosses a border on its own, each one pays international postage, waits in customs and takes weeks to arrive. Customers notice, and returns become expensive.",
          "Local fulfilment flips this. You send your stock in bulk to a hub in your customers' country once, and each order then travels only a short local journey.",
        ],
      },
      {
        heading: "What a local fulfilment hub does",
        paragraphs: [
          "A hub receives your boxes, counts every unit and photographs each arrival. It stores your stock, and when an order comes in it picks the items, packs them, photographs the sealed parcel and hands it to a local carrier with tracking.",
          "With Posygo, hubs are run by vetted local partners. You see every box from the moment you declare it to the moment it's counted, and every order from packing to delivery.",
        ],
      },
      {
        heading: "The steps to get started",
        paragraphs: [
          "Create a seller account and choose the country you sell to. Add your products with their weights and sizes. Declare the shipment you're sending and we give you the hub address.",
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
          "When a box reaches the hub it's opened, every unit is counted and the arrival is photographed. The stocking fee covers that work and is charged once per box, together with that box's first month of storage. In some countries your first shipment's stocking fee is waived.",
        ],
      },
      {
        heading: "Storage: per box, by size, each month",
        paragraphs: [
          "Storage is charged per box rather than per shelf or per square metre, so you pay for the space your stock actually takes. Boxes come in sizes from small to pallet, and the largest are priced by quote.",
          "Storage is billed at the start of each month for every box still at the hub. Selling through stock faster lowers this cost.",
        ],
      },
      {
        heading: "Packing: per order",
        paragraphs: ["Each order has a base packing fee that covers the first unit, plus a small fee for each extra unit, up to a cap. A large order never costs more to pack than the cap."],
      },
      {
        heading: "Shipping and returns",
        paragraphs: [
          "Shipping is charged at the carrier's price plus a small percentage. Returns that come back to the hub have a fixed handling fee for checking the item and putting it back into stock or setting it aside.",
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
    slug: "keeping-stock-safe-at-a-fulfilment-hub",
    title: "How we keep your stock safe at a local fulfilment hub",
    description: "The checks, limits and evidence that protect a seller's stock at a Posygo hub, from partner vetting to surprise counts and insurance.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Every partner is checked before taking stock",
        paragraphs: [
          "Each hub partner passes an identity check, proves their address, gives a referee we contact, shows us their storage space and signs our partner agreement before receiving any stock.",
        ],
      },
      {
        heading: "Trust is earned in steps",
        paragraphs: [
          "New partners can only hold low-value stock up to a low limit. The limit grows as they build a track record. Part of every partner's pay is held back for two months in case of claims.",
        ],
      },
      {
        heading: "Evidence at every step",
        paragraphs: [
          "Every arrival is photographed when it's counted, and every parcel is photographed sealed before it leaves. A partner isn't paid for an order until it has a dispatch photo and tracking.",
          "We also run surprise video stock counts and send test orders that partners can't tell apart from real ones.",
        ],
      },
      {
        heading: "Insurance we hold, not the partner",
        paragraphs: [
          "Your stock is insured while it's at a hub, and the cover is ours, not the partner's. If something is lost or damaged, the photos and the custody record make the claim quick to settle, and approved claims are credited to your wallet.",
        ],
      },
    ],
    related: [
      { href: "/how-it-works", label: "How Posygo works" },
      { href: "/partners", label: "How partners are vetted" },
    ],
  },
  {
    slug: "buy-from-shops-abroad",
    title: "How to buy from shops abroad that don't ship to you",
    description: "How Posygo's personal shopping works: send links, get one price up front, and we buy the items and send them to you in a single tracked parcel.",
    updated: "2026-10-27",
    sections: [
      {
        heading: "Send us the links",
        paragraphs: [
          "Paste links to the things you want from shops in one of the countries we serve, with quantities and any notes. Then confirm your request from the email we send you. Nothing happens until you confirm.",
        ],
      },
      {
        heading: "Get one price before you pay",
        paragraphs: ["We price the items, our fee and shipping to your address, and send you a single total. You pay nothing until you accept it, and you can cancel before then."],
      },
      {
        heading: "We buy, check and ship",
        paragraphs: [
          "Once you've paid we buy the items. They arrive at our hub, where they're checked and photographed. If anything doesn't arrive, it's refunded. Everything then goes to you in one parcel with tracking.",
        ],
      },
    ],
    related: [{ href: "/shop-for-me", label: "Start a shopping request" }],
  },
];

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
