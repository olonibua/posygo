import { describePage } from "@/features/assistant/knowledge/types";

const MESSAGE_FIELD = {
  body: {
    labels: ["Message"],
    meaning: "What you want to say. Add an order, transfer, return or case number and it becomes a link the other side can open or copy.",
    mistakes: ["Up to 2,000 characters."],
  },
};

const CUSTOMER_CHAT = {
  title: "Messages",
  purpose: "A live conversation with the Posygo team. Messages arrive straight away. If you're away, we tell you in the app and by email.",
  steps: [
    "Write your message and press Send, or press Enter. Shift and Enter starts a new line.",
    "Add an order, transfer or case number so we can find it quickly.",
    "To answer one message in particular, press Reply under it.",
    "If a message doesn't send, press Try again. It's never sent twice.",
  ],
  fields: MESSAGE_FIELD,
} as const;

export const VENDOR_CHAT_KNOWLEDGE = describePage<{ body: string }>({
  route: "/messages",
  ...CUSTOMER_CHAT,
  related: [{ href: "/settings/requests", label: "Help & requests" }],
});

export const PARTNER_CHAT_KNOWLEDGE = describePage<{ body: string }>({
  route: "/admin/messages",
  ...CUSTOMER_CHAT,
  related: [{ href: "/admin/requests", label: "Help & requests" }],
});

export const TEAM_CHAT_KNOWLEDGE = describePage<{ body: string }>({
  route: "/admin/chat",
  title: "Messages",
  purpose: "Conversations with sellers and partners. Waiting means they wrote last and nobody has replied yet. The team is alerted once when a conversation starts waiting.",
  steps: [
    "Pick a conversation. Waiting ones are at the top.",
    "Reply with Send or Enter. Press Reply under a message to answer it directly.",
    "Order and case numbers in a message are links or can be copied.",
    "If the seller or partner isn't online, they get one alert in the app and by email until they read it.",
  ],
  fields: MESSAGE_FIELD,
  related: [{ href: "/admin/support", label: "Support cases" }],
});
