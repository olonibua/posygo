import type { CreateLegalDocumentInput, VerificationDecisionInput } from "@/shared";

import { describePage } from "@/features/assistant/knowledge/types";

export const LEGAL_DOCUMENTS_KNOWLEDGE = describePage<CreateLegalDocumentInput>({
  route: "/admin/legal",
  title: "Agreements and policies",
  purpose: "Publish new versions of each market's agreements and policies. Published versions can't be edited or deleted.",
  steps: [
    "Choose the market and the document.",
    "Give the new version a name and a title.",
    "Paste the full text approved by counsel and publish it.",
    "Publishing a new vendor agreement asks every vendor in that market to accept it again.",
  ],
  fields: {
    countryCode: { labels: ["Market"], meaning: "The market this version applies to." },
    kind: { labels: ["Document"], meaning: "Which agreement or policy you're publishing a new version of, for example the vendor agreement or the partner agreement." },
    version: { labels: ["Version"], meaning: "A short name for this version.", example: "2026-11", mistakes: ["Use letters, numbers, dots or dashes, up to 32 characters."] },
    title: { labels: ["Title"], meaning: "The title people see above the document.", mistakes: ["Between 3 and 160 characters."] },
    body: { labels: ["Full text"], meaning: "The whole document, exactly as approved by counsel. It can't be changed once published.", mistakes: ["At least 50 characters."] },
  },
  related: [{ href: "/admin/countries", label: "Countries" }],
});

export const VERIFICATION_QUEUE_KNOWLEDGE = describePage({
  route: "/admin/verifications",
  title: "Business verifications",
  purpose: "Vendor businesses waiting for their verification to be checked, oldest first.",
  steps: ["Start with the submitted cases.", "Open a case to read the answers and documents and make a decision."],
  fields: {},
  related: [{ href: "/admin/support", label: "Support cases" }],
});

export const VERIFICATION_CASE_KNOWLEDGE = describePage<VerificationDecisionInput>({
  route: "/admin/verifications/[vendorId]",
  title: "Verification case",
  purpose: "One vendor's verification answers, identity check result and documents, and the decision on them. Opening a document or an ID number is written to the audit log.",
  steps: [
    "Read the business, contact and operations answers.",
    "Check the identity check result: whether it passed, the document type, issuing country, expiry, and whether the name on the ID matches the contact. We keep only the result, not the ID photos.",
    "Open the business document. Older cases may also have uploaded ID photos and a typed ID number you can reveal.",
    "Approve, ask for changes or reject. When asking for changes or rejecting, write a note to the vendor.",
  ],
  fields: {
    decision: { labels: [], meaning: "Approve, ask for changes or reject. You choose with the buttons under the note." },
    reason: {
      labels: ["Note to the vendor"],
      meaning: "What the vendor needs to change, or why they're rejected. They see it word for word.",
      mistakes: ["Required when asking for changes or rejecting, at least 10 characters."],
    },
  },
  related: [{ href: "/admin/verifications", label: "Business verifications" }],
});
