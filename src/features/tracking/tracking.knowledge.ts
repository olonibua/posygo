import { describePage, type FieldHelp } from "@/features/assistant/knowledge/types";

const TRACKING_NUMBER: FieldHelp = { labels: ["Tracking number"], meaning: "The tracking number from your shipping email.", mistakes: ["Use 6 to 64 letters, numbers or dashes, with no spaces."] };

export const TRACK_KNOWLEDGE = describePage<{ trackingNumber: string }>({
  route: "/track",
  title: "Track a parcel",
  purpose: "Find out where a parcel sent from one of our hubs is.",
  steps: ["Copy the tracking number from your shipping email.", "Paste it in and press Track."],
  fields: { trackingNumber: TRACKING_NUMBER },
  related: [
    { href: "/account", label: "Your orders" },
    { href: "/marketplace", label: "Marketplace" },
  ],
});

export const TRACK_RESULT_KNOWLEDGE = describePage<{ trackingNumber: string }>({
  route: "/track/[trackingNumber]",
  title: "Parcel tracking",
  purpose: "Shows where your parcel is, the carrier, and every update the carrier has sent.",
  steps: [
    "Check the status and the progress bar.",
    "Read the updates list for each carrier scan.",
    "Open the carrier's site for more detail, if a link is shown.",
    "To look up another parcel, enter a new tracking number below.",
  ],
  fields: { trackingNumber: { ...TRACKING_NUMBER, mistakes: [...(TRACKING_NUMBER.mistakes ?? []), "New labels can take a few minutes to appear, so try again shortly if it isn't found."] } },
  related: [
    { href: "/track", label: "Track another parcel" },
    { href: "/account", label: "Your orders" },
  ],
});
