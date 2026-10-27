import type { DiscountCodeInput, ProductListingInput, ReturnDecisionInput, StorefrontSettingsInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const STOREFRONT_KNOWLEDGE = describePage<StorefrontSettingsInput & ProductListingInput & DiscountCodeInput & ReturnDecisionInput>({
  route: "/storefront",
  title: "Your store",
  purpose: "Sell straight to buyers from the stock held for you. Buyers pay, the hub packs and sends the order, and your share reaches your bank once the return window closes.",
  steps: [
    "Choose your store name and web address, and save your store details.",
    "List at least one product with a price.",
    "Connect a bank account for your sales.",
    "Open your store. The one-time set-up fee shown on the page comes from your wallet when you open, unless it's already paid.",
    "Follow store orders and payouts, decide on buyers' return requests, and create discount codes.",
  ],
  fields: {
    displayName: { labels: ["Store name"], meaning: "The name buyers see on your store.", mistakes: ["Use 2 to 80 characters."] },
    slug: {
      labels: ["Store address"],
      meaning: "The end of your store's web address. Buyers visit /store/ followed by this.",
      example: "glow-hair",
      mistakes: ["Use 3 to 40 lowercase letters, numbers and hyphens, starting and ending with a letter or number.", "Some addresses are reserved, like store, checkout or admin."],
    },
    about: { labels: ["About your store"], meaning: "A short introduction shown at the top of your store. Optional.", mistakes: ["Up to 2000 characters."] },
    tone: { labels: ["Colour", "Store colour"], meaning: "The colour used to style your store." },
    returnsAllowed: { labels: ["Accept returns"], meaning: "Whether buyers can ask to return an order." },
    returnWindowDays: {
      labels: ["Days to return"],
      meaning: "How many days buyers have to ask for a return. Your payout for each order waits until this has passed.",
      mistakes: ["Use a number from 1 to 365."],
    },
    listed: { labels: [], meaning: "Whether a product is shown in your store. Choose List to show it and Hide to take it down.", mistakes: ["A product needs a price before it can be listed."] },
    retailPriceMinor: { labels: [/^Price for .+$/], meaning: "What buyers pay for one unit, in your store's currency. For a listed product, the new price is saved when you leave the box." },
    description: { labels: [], meaning: "A description of the product for buyers. It isn't set on this page." },
    category: { labels: [], meaning: "The category a product is shown under in your store. It isn't set on this page." },
    kind: { labels: ["Discount type"], meaning: "Percentage off takes a share off the price. Amount off takes a fixed amount off. Discounts come out of your share of the sale." },
    code: {
      labels: ["Code"],
      meaning: "The code buyers type at checkout. It's saved in capital letters.",
      example: "SUMMER-10",
      mistakes: ["Use 3 to 40 letters, numbers and hyphens, starting with a letter or number."],
    },
    percentBps: { labels: ["Percent off"], meaning: "How much is taken off, as a percentage.", mistakes: ["Use a number between 1 and 90."] },
    amountMinor: { labels: [/^Amount off \(/], meaning: "How much is taken off, in your store's currency." },
    minGoodsMinor: { labels: [/^Minimum spend \(/], meaning: "The least a buyer must spend on products for the code to work. Leave it blank for no minimum." },
    startsAt: { labels: [], meaning: "When the code starts working. This form doesn't ask for a start date." },
    endsAt: { labels: ["Last day (optional)"], meaning: "The last day the code can be used. Leave it blank for no end date." },
    maxRedemptions: { labels: ["Times it can be used (optional)"], meaning: "How many times the code can be used in total. Leave it blank for no limit." },
    accept: { labels: [], meaning: "Your decision on a buyer's return request: accept it and refund them, or turn it down." },
    refundMinor: { labels: ["Refund"], meaning: "How much to refund the buyer if you accept the return. It can't be more than your share of the sale that's left." },
    note: {
      labels: ["Message to the buyer"],
      meaning: "A note for the buyer saying what happens next, for example whether they can keep the item.",
      mistakes: ["Write at least 3 characters, and up to 1000."],
    },
  },
  related: [
    { href: "/products", label: "Your products" },
    { href: "/wallet", label: "Wallet" },
    { href: "/marketplace", label: "Marketplace" },
  ],
});
