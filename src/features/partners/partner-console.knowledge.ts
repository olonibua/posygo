import type {
  InsurancePolicyInput,
  PartnerProfileInput,
  partnerTeamInviteSchema,
  ProofOfAddressInput,
  RefereeInput,
  SignAgreementInput,
  StatementRange,
  StorageSpaceInput,
  SubmitStockCountInput,
  WorkStatusInput,
} from "@/shared";
import type { z } from "zod";

import { describePage, type PageKnowledgeOf } from "@/features/assistant/knowledge/types";

export type PartnershipInput = PartnerProfileInput & ProofOfAddressInput & StorageSpaceInput & WorkStatusInput & RefereeInput & SignAgreementInput & InsurancePolicyInput;

export const PARTNERSHIP: Omit<PageKnowledgeOf<PartnershipInput>, "route"> = {
  title: "Partnership",
  purpose: "For fulfilment partners: your partnership from verification to running your hub, with your tier, scorecard and trust score once you're approved.",
  steps: [
    "Check your details, then complete each verification step: identity, proof of address, your storage space, work and tax status, and a referee.",
    "For identity, press Verify your identity. On a computer, scan the QR code with your phone's camera, or choose Continue on this device instead. On a phone, tap Open identity check. It takes about 2 minutes and the step updates by itself when it's done.",
    "Read and sign the partner agreement, and set up payouts with our payment provider.",
    "When every step is done, press Send for review.",
    "Once approved, follow your scorecard and trust score here.",
  ],
  fields: {
    fullName: { labels: ["Full name"], meaning: "Your full name as it appears on your ID.", mistakes: ["Between 2 and 160 characters."] },
    phone: { labels: ["Phone"], meaning: "A phone number we can reach you on.", mistakes: ["Use digits, spaces or dashes, with an optional + at the start."] },
    addressLines: { labels: ["Storage address"], meaning: "The first line of the address where you'll store stock. Your proof of address must show this address." },
    city: { labels: ["City"], meaning: "The town or city of your storage address." },
    postalCode: { labels: ["Postcode"], meaning: "The postcode of your storage address." },
    spaceDescription: { labels: ["About the space"], meaning: "A short description of the space where you'll keep stock.", mistakes: ["At least 20 characters."] },
    documentType: { labels: ["Type of document"], meaning: "What kind of document proves your address: a utility bill, a bank statement, or a council tax or property tax letter." },
    issuedOn: { labels: ["Date on the document"], meaning: "The date printed on your proof of address.", mistakes: ["Use a document dated within the last 3 months, and not in the future."] },
    fileId: {
      labels: ["Document", "Policy certificate", "Choose file"],
      meaning:
        "The file you upload: your proof of address, which must show your name and storage address, or your insurance certificate. Only our verification team can open a proof of address, and we delete it after our decision.",
      mistakes: ["A proof of address can be a PDF or photo up to 10 MB.", "An insurance certificate can be a PDF or photo up to 15 MB."],
    },
    description: { labels: ["Describe the space"], meaning: "Where your storage space is, how big it is, how it locks, and how you keep it dry.", mistakes: ["At least 20 characters."] },
    fileIds: {
      labels: ["Photo or video", /^Photo or video \d+$/],
      meaning: "Photos or videos of your storage space.",
      mistakes: ["Add at least two.", "Photos can be up to 15 MB and videos up to 100 MB."],
    },
    declaration: { labels: [/^I /], meaning: "Confirms the work and tax declaration for your country, such as having the right to work and declaring what you earn." },
    taxId: {
      labels: [/\(optional\)$/, "Tax reference", "Unique Taxpayer Reference (UTR)", "EIN or SSN"],
      meaning: "Your tax reference for your country. It's stored encrypted and only used for tax reporting. Some countries require it.",
      mistakes: ["Up to 40 characters, in your country's format."],
    },
    name: { labels: ["Their name"], meaning: "The name of someone who can vouch for you.", mistakes: ["Between 2 and 120 characters."] },
    contact: { labels: ["Email or phone"], meaning: "How we can contact your referee.", mistakes: ["Between 5 and 160 characters."] },
    relationship: { labels: ["How they know you"], meaning: "How your referee knows you, for example a former employer.", mistakes: ["Between 2 and 160 characters."] },
    documentId: { labels: [], meaning: "The version of the partner agreement you're signing. It's filled in for you." },
    signature: {
      labels: ["Full name", "Draw", "Type", /electronic signature/],
      meaning: "Your signature on the partner agreement. Open Review and sign, tap Sign here, then draw it with your finger or mouse, or type your name.",
      mistakes: ["The name must match the name on your application exactly.", "Tick the box to confirm your electronic signature."],
    },
    insurer: { labels: ["Insurer"], meaning: "The company that provides your own insurance.", mistakes: ["Between 2 and 120 characters."] },
    policyNumber: { labels: ["Policy number"], meaning: "The number of your insurance policy.", mistakes: ["Between 3 and 60 characters."] },
    coverMinor: { labels: ["Cover"], meaning: "How much your policy covers. We ask for a set amount of cover, shown above the form." },
    startsOn: { labels: ["Starts"], meaning: "The day your policy starts." },
    expiresOn: { labels: ["Ends"], meaning: "The day your policy ends. We remind you 30 and 7 days before it ends.", mistakes: ["The policy must end after it starts."] },
  },
  related: [
    { href: "/admin/partnership/earnings", label: "Earnings" },
    { href: "/admin/partnership/team", label: "Team" },
  ],
};

export const PARTNERSHIP_KNOWLEDGE = describePage<PartnershipInput>({ ...PARTNERSHIP, route: "/admin/partnership" });

export const PARTNER_EARNINGS_KNOWLEDGE = describePage<StatementRange>({
  route: "/admin/partnership/earnings",
  title: "Earnings",
  purpose: "For fulfilment partners: your share of what vendors pay for receiving, storage, and pick and pack.",
  steps: [
    "Check what's available to pay out and what's held back.",
    "Pick a date range to see what you earned and were paid in it.",
    "If an order is waiting for a dispatch photo, add the photo from the order page so its pay is released.",
  ],
  fields: {
    from: { labels: ["From"], meaning: "The first day of the range you want to see." },
    to: { labels: ["To"], meaning: "The last day of the range you want to see.", mistakes: ["The start date must be on or before the end date."] },
  },
  related: [
    { href: "/admin/partnership", label: "Partnership" },
    { href: "/admin/orders", label: "Orders" },
  ],
});

export const HUB_STOCK_COUNTS_KNOWLEDGE = describePage<SubmitStockCountInput>({
  route: "/admin/partnership/stock-counts",
  title: "Stock counts",
  purpose: "For fulfilment partners: counts we ask you to film, so we can check your hub's stock matches our records.",
  steps: [
    "Find each item on the shelf using its product code, lot and location.",
    "Film the count in one take, showing each item and its label.",
    "Enter the number you counted for every item.",
    "Upload the video and press Send count before it's due.",
  ],
  fields: {
    lines: { labels: [/^Count for /], meaning: "How many of this item you counted on the shelf. Enter what you see, not what you expect." },
    videoFileId: { labels: ["Video of the count", "Choose file"], meaning: "The video of your count.", mistakes: ["MP4 or MOV, up to 200 MB."] },
  },
  related: [{ href: "/admin/partnership", label: "Partnership" }],
});

export const PARTNER_TEAM_KNOWLEDGE = describePage<z.infer<typeof partnerTeamInviteSchema>>({
  route: "/admin/partnership/team",
  title: "Team",
  purpose: "For fulfilment partners: people who help you at your hub. Team members can receive, store and pack, but can't change the partnership or see earnings.",
  steps: [
    "Enter the email of the person you want to invite and send the invitation.",
    "They set a password and two-factor sign-in when they accept.",
    "Revoke an invitation that hasn't been accepted, or suspend a team member who no longer helps.",
  ],
  fields: { email: { labels: ["Email"], meaning: "The email address of the person you're inviting.", mistakes: ["Enter a valid email address."] } },
  related: [{ href: "/admin/partnership", label: "Partnership" }],
});
