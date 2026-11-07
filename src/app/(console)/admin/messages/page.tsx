import type { Metadata } from "next";

import { CustomerChatPage } from "@/features/chat/customer-chat-page";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return <CustomerChatPage />;
}
