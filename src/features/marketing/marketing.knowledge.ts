import type { PartnerApplicationInput, RefereeInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const PARTNERS_KNOWLEDGE = describePage<PartnerApplicationInput & RefereeInput>({
  route: "/partners",
  title: "Become a fulfilment partner",
  purpose: "Apply to earn from a spare room or unit by receiving, storing and packing orders for sellers near you.",
  steps: [
    "Read how it works and the checks involved.",
    "Fill in your details and the address where you'd store stock.",
    "Describe the space.",
    "Add a referee from your community.",
    "Agree to how we use your details and send the application.",
    "Check your email for a link to set your password, then finish the verification steps online.",
  ],
  fields: {
    fullName: { labels: ["Full name"], meaning: "Your full name, as it appears on your ID.", mistakes: ["At least 2 characters."] },
    email: { labels: ["Email"], meaning: "We send a link here to set your password and continue your application." },
    phone: { labels: ["Phone"], meaning: "A number we can reach you on.", mistakes: ["Use digits, spaces, brackets or dashes, with an optional + at the start."] },
    countryCode: { labels: ["Country"], meaning: "The country where your space is. Only countries taking applications are listed." },
    addressLines: { labels: ["Address where you'd store stock"], meaning: "The street address of the space where stock would be kept. You'll prove this address later in the checks." },
    city: { labels: ["Town or city"], meaning: "The town or city of the space." },
    postalCode: { labels: ["Postcode"], meaning: "The postcode of the space.", mistakes: ["Between 2 and 16 characters."] },
    spaceDescription: {
      labels: ["Tell us about the space"],
      meaning: "Roughly how big it is, whether it locks, and how you keep it dry.",
      example: "A spare bedroom about 3 by 3 metres with a lock on the door and no damp.",
      mistakes: ["At least 20 characters, up to 1,000."],
    },
    referee: { labels: ["A referee from your community"], meaning: "Someone who knows you and can vouch for you. We contact them as part of your application." },
    name: { labels: ["Their name"], meaning: "Your referee's name.", mistakes: ["At least 2 characters."] },
    contact: { labels: ["Their email or phone"], meaning: "How we can reach your referee.", mistakes: ["At least 5 characters."] },
    relationship: { labels: ["How they know you"], meaning: "How you know each other.", example: "My neighbour for five years" },
    heardFrom: { labels: ["How did you hear about us?"], meaning: "Where you first heard about the partner programme." },
    consent: {
      labels: [/^I agree that you can use these details/],
      meaning: "Lets us use your details to assess your application and contact your referee. You can't send the application without it.",
    },
  },
  related: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/legal/privacy", label: "Privacy policy" },
  ],
});

export const HOME_KNOWLEDGE = describePage({
  route: "/",
  title: "Posygo",
  purpose: "An overview of how sellers get their products closer to their customers: we store their stock in the country they sell to, then pack and deliver every order in days.",
  steps: ["Read how it works.", "See which countries we deliver in.", "Create an account when you're ready to send stock."],
  fields: {},
  related: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Prices" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const PRICING_KNOWLEDGE = describePage({
  route: "/pricing",
  title: "Pricing",
  purpose: "The prices in force today in each country we serve: stocking and storage per box, a fee per packed order, and shipping. No subscription.",
  steps: ["Find the country you sell to.", "Check the prices, shown in that country's currency.", "Read the questions at the bottom for how charges work."],
  fields: {},
  related: [
    { href: "/fulfilment", label: "Where we deliver" },
    { href: "/guides/fulfilment-costs-explained", label: "Fulfilment costs explained" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const HOW_IT_WORKS_KNOWLEDGE = describePage({
  route: "/how-it-works",
  title: "How it works",
  purpose: "How selling abroad works here: choose a country, send us your stock, sell as usual, and each order is packed, photographed and delivered with tracking.",
  steps: ["Choose the countries you sell to.", "Send us your stock.", "Sell as usual.", "Customers get their orders in days."],
  fields: {},
  related: [
    { href: "/pricing", label: "Prices" },
    { href: "/fulfilment", label: "Where we deliver" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const FULFILMENT_KNOWLEDGE = describePage({
  route: "/fulfilment",
  title: "Where we deliver",
  purpose: "Lists the countries where we store stock and deliver orders, with the currency and starting packing price for each.",
  steps: ["Find the country you sell to.", "Open it to see its prices and how it works there."],
  fields: {},
  related: [
    { href: "/pricing", label: "All prices" },
    { href: "/how-it-works", label: "How it works" },
  ],
});

export const FULFILMENT_COUNTRY_KNOWLEDGE = describePage({
  route: "/fulfilment/[country]",
  title: "Fulfilment in one country",
  purpose: "Prices, how it works and common questions for storing your stock and delivering orders in this country.",
  steps: ["Check the prices for this country.", "Read how it works and the questions sellers ask.", "Start selling here, or look at the other countries we deliver in."],
  fields: {},
  related: [
    { href: "/fulfilment", label: "All countries" },
    { href: "/pricing", label: "All prices" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const GUIDES_KNOWLEDGE = describePage({
  route: "/guides",
  title: "Guides",
  purpose: "Plain guides for sellers on selling abroad, what fulfilment costs and how stock is kept safe.",
  steps: ["Pick a guide that answers your question.", "Open it to read."],
  fields: {},
  related: [
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Prices" },
  ],
});

export const GUIDE_KNOWLEDGE = describePage({
  route: "/guides/[slug]",
  title: "Guide",
  purpose: "A guide to one topic about selling abroad and getting orders to customers fast.",
  steps: ["Read the guide section by section.", "Follow the related links at the end for more."],
  fields: {},
  related: [
    { href: "/guides", label: "All guides" },
    { href: "/signup", label: "Create an account" },
  ],
});

export const LEGAL_KNOWLEDGE = describePage({
  route: "/legal/[document]",
  title: "Legal document",
  purpose: "The published terms of service, privacy policy or vendor agreement for a country we serve.",
  steps: ["Choose a country if more than one is shown.", "Read the document. Its version and publish date are at the top."],
  fields: {},
  related: [
    { href: "/legal/terms", label: "Terms of service" },
    { href: "/legal/privacy", label: "Privacy policy" },
    { href: "/legal/vendor-agreement", label: "Vendor agreement" },
  ],
});
