"use client";

import { useRef } from "react";

import { PageHeader } from "@/components/ui/page-header";
import { FormAlert } from "@/components/ui/form-controls";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";

import { ChatConversation } from "./chat-conversation";
import { useFitToScreen } from "./use-fit-to-screen";
import { useOwnThread } from "./use-chat";

export function CustomerChatPage() {
  const own = useOwnThread();
  const panel = useRef<HTMLDivElement>(null);
  const { keyboardOpen } = useFitToScreen(panel);
  return (
    <div className="flex flex-col gap-6">
      {keyboardOpen ? null : <PageHeader stamp="Messages" title="Talk to our team" lead="Ask anything. Add an order, transfer or case number and we'll look it up." />}
      <Paper ref={panel} className="flex h-[calc(100dvh-300px)] flex-col overflow-hidden md:min-h-[440px]">
        {own.data ? (
          <ChatConversation threadId={own.data.thread.id} side="CUSTOMER" initial={own.data} emptyNote="Say hello. We usually reply within working hours." />
        ) : own.isError ? (
          <div className="p-5">
            <FormAlert message="We couldn't open your messages. Try again shortly." />
          </div>
        ) : (
          <div className="p-5">
            <SkeletonLines lines={5} />
          </div>
        )}
      </Paper>
    </div>
  );
}
