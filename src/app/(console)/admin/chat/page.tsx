import type { Metadata } from "next";
import { Suspense } from "react";

import { TeamChatPage } from "@/features/chat/team-chat-page";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return (
    <Suspense>
      <TeamChatPage />
    </Suspense>
  );
}
