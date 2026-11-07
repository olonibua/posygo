"use client";

import { type ChatThreadView, hasPermission } from "@/shared";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { formatDateTime, localeFor } from "@/lib/format";

import { ChatConversation } from "./chat-conversation";
import { useInbox } from "./use-chat";

export function TeamChatPage() {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const inbox = useInbox();
  const router = useRouter();
  const pathname = usePathname();
  const selected = useSearchParams().get("thread");
  const open = (id: string | null) => router.replace(id ? `${pathname}?thread=${id}` : pathname, { scroll: false });
  const threads = inbox.data ?? [];
  const current = threads.find((thread) => thread.id === selected);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader stamp="Messages" title="Sellers and partners" lead="Waiting conversations come first." />
      <Paper className="grid h-[calc(100dvh-300px)] min-h-[460px] overflow-hidden md:grid-cols-[300px_1fr]">
        <nav aria-label="Conversations" className={cn("min-h-0 overflow-y-auto border-line md:border-r", selected && "hidden md:block")}>
          {inbox.isLoading ? (
            <div className="p-4">
              <SkeletonLines lines={6} />
            </div>
          ) : threads.length === 0 ? (
            <EmptyState title="No messages yet" body="When a seller or partner writes, their conversation shows here." />
          ) : (
            <ul>
              {threads.map((thread) => (
                <li key={thread.id}>
                  <ThreadRow thread={thread} active={thread.id === selected} locale={locale} onOpen={() => open(thread.id)} />
                </li>
              ))}
            </ul>
          )}
        </nav>
        <section className={cn("min-h-0 flex-col", selected ? "flex" : "hidden md:flex")}>
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <button type="button" onClick={() => open(null)} className="md:hidden" aria-label="Back to conversations">
                  <Icon name="back" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-small font-semibold">{current?.account.name ?? "Conversation"}</p>
                  {current ? (
                    <p className="text-meta text-ink-soft">
                      {current.account.kind === "PARTNER" ? "Fulfilment partner" : "Seller"} · {current.account.countryCode}
                    </p>
                  ) : null}
                </div>
              </div>
              <ChatConversation key={selected} threadId={selected} side="TEAM" canReply={hasPermission(user.role, "support.manage")} emptyNote="No messages in this conversation yet." />
            </>
          ) : (
            <p className="m-auto px-6 text-center text-small text-ink-soft">Pick a conversation to read it.</p>
          )}
        </section>
      </Paper>
    </div>
  );
}

function ThreadRow({ thread, active, locale, onOpen }: { thread: ChatThreadView; active: boolean; locale: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active || undefined}
      className={cn("flex w-full flex-col gap-1 border-b border-line px-4 py-3 text-left hover:bg-paper-sunk", active && "bg-paper-sunk")}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-small font-semibold">{thread.account.name}</span>
        {thread.unread > 0 ? <span className="rounded-full bg-yellow px-2 text-meta font-semibold text-cocoa">{thread.unread}</span> : null}
      </span>
      {thread.lastMessage ? <span className="line-clamp-1 text-meta text-ink-soft">{thread.lastMessage.body}</span> : null}
      <span className="flex items-center gap-2 text-meta text-ink-faint">
        {thread.waitingSince ? <span className="font-semibold text-danger">Waiting</span> : null}
        {thread.lastMessage ? formatDateTime(thread.lastMessage.createdAt, locale) : null}
      </span>
    </button>
  );
}
