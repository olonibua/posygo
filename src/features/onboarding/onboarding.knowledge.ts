import type { InviteMemberInput, VerificationSubmission } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const TEAM_KNOWLEDGE = describePage<InviteMemberInput>({
  route: "/settings/team",
  title: "Your team",
  purpose: "Invite people to help run your account. Members can see stock and orders; only the owner can verify the business, accept agreements and manage the team.",
  steps: ["Enter a colleague's email address and send the invite.", "Watch pending invitations and revoke any you no longer need.", "Remove a member when they no longer need access."],
  fields: {
    email: {
      labels: ["Invite by email"],
      meaning: "The email address of the person you want to invite. They get an invitation to join your business, which expires on the date shown.",
      mistakes: ["It has to be a valid email address."],
    },
  },
  related: [{ href: "/settings/security", label: "Sign-in and security" }],
});

const COMPANY_NUMBER_LABELS = ["Company registration number", "Companies House number", "EIN"];
const TAX_NUMBER_LABELS = ["Tax number (optional)", "VAT number"];

type VerificationPageInput = Omit<VerificationSubmission, "idType" | "idExpiry"> & { identity: string };

export const VERIFICATION_KNOWLEDGE = describePage<VerificationPageInput>({
  route: "/verification",
  title: "Verify your business",
  purpose: "We check every business against its market's rules before stock can be sent to a warehouse. Once you're verified, have signed the vendor agreement, accepted the terms and privacy policy, and paid the activation fee, your account goes live.",
  steps: [
    "Fill in your business details and registered address.",
    "Add the person we speak to.",
    "Verify your identity: on a computer, scan the QR code with your phone's camera, or tap Open identity check on a phone. You take a photo of your ID and a short selfie video. It takes about 2 minutes, and this page updates by itself when it's done.",
    "Upload a business document.",
    "Tell us what you'll store and roughly how much, then check everything and submit for review.",
    "Once approved, open the Fulfilment Services Agreement with Review and sign, tap Sign here, then draw your signature or type your name. You can download a signed copy with its certificate afterwards.",
    "Read and accept the Terms of Service and the Privacy Policy.",
    "When everything is signed, Activate your account opens. Pay the one-off activation fee there. Your account goes live as soon as it's paid, and we email you your account details. The activation fee isn't refundable.",
  ],
  fields: {
    businessType: { labels: ["Business type"], meaning: "How your business is set up, for example a sole trader or a limited company. The choices depend on your market." },
    legalBusinessName: { labels: ["Legal business name"], meaning: "Your business's name exactly as it's registered.", mistakes: ["Use 2 to 160 characters."] },
    registrationCountryCode: { labels: ["Country of registration"], meaning: "The country where your business is registered." },
    companyNumber: {
      labels: COMPANY_NUMBER_LABELS,
      meaning: "Your company's registration number. If you're registered in your market's country, it's checked against that country's format.",
      mistakes: ["Up to 40 characters.", "It must match your country's format, for example a Companies House number in the UK."],
    },
    taxNumber: {
      labels: TAX_NUMBER_LABELS,
      meaning: "Your business's tax number, such as a VAT number. Optional.",
      mistakes: ["Up to 40 characters.", "If you give one for your market's country, it must match that country's format."],
    },
    registeredAddress: {
      labels: ["Registered address", "Address line 2", "Town or city", /^(Region|County|State|Province)/, /^(Postal code|Postcode|ZIP code)/],
      meaning: "Your business's official registered address.",
      mistakes: ["The first line and town or city need at least 2 characters.", "For your market's country, the postcode must be valid, and some countries also need the region or state."],
    },
    contactFullName: { labels: ["Full name"], meaning: "The person responsible for this account.", mistakes: ["Use 2 to 120 characters."] },
    contactRole: { labels: ["Role"], meaning: "That person's role in the business.", example: "Director", mistakes: ["Use 2 to 80 characters."] },
    contactPhone: {
      labels: ["Phone"],
      meaning: "A phone number for that person, in international format.",
      example: "+447700900123",
      mistakes: ["Start with + and your country code, with no spaces."],
    },
    identity: {
      labels: ["Verify your identity", "Open identity check", "Scan with your phone's camera", "Continue on this device instead", "Continue check", "Try again"],
      meaning:
        "The identity check confirms the contact person with a photo of their passport, driving licence or ID card and a short selfie video. On a computer, scan the QR code with your phone's camera and keep this page open; it updates when you finish. The name on the ID must match the contact's full name. We keep only the result, never the photos.",
      mistakes: [
        "If it didn't pass, the reason shows on the page. Use good light, show the whole ID, and try again.",
        "If the link expired or the check wasn't finished, press Try again.",
        "Changing the contact's name means doing the check again.",
      ],
    },
    documents: {
      labels: ["Business document", "Choose file", "Replace"],
      meaning: "A business document such as a certificate of incorporation, or a recent utility bill for sole traders. Files are stored privately and only verification staff can open them.",
      mistakes: ["Use a JPEG, PNG, WebP image or a PDF."],
    },
    productsDescription: { labels: ["What will you store with us?"], meaning: "A sentence or two about the products you'll send in.", mistakes: ["Use 10 to 1000 characters."] },
    monthlyUnits: { labels: ["Units arriving per month"], meaning: "Roughly how many units you expect to send to the hub each month." },
    monthlyOrders: { labels: ["Orders per month"], meaning: "Roughly how many orders you expect to ship each month." },
    hazards: {
      labels: ["Do any products need special handling?"],
      meaning: "Tick anything that applies to your products: batteries, liquids, fragile or flammable items. Choose None of these if nothing applies.",
      mistakes: ["Choose at least one.", "None of these can't be picked together with the others."],
    },
  },
  related: [
    { href: "/overview", label: "Overview" },
    { href: "/settings/team", label: "Your team" },
  ],
});
