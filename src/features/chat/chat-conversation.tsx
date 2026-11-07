"use client";

import type { ChatMessageView, ChatPageView, ChatSide } from "@/shared";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-controls";
import { SkeletonLines } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { localeFor } from "@/lib/format";

import { Bubble, PendingBubble } from "./chat-bubbles";
import { Composer } from "./chat-composer";
import { useChatConnected, useEarlierMessages, useMarkRead, useSendMessage, useThreadPage, useTyping } from "./use-chat";

interface ConversationProps {
  threadId: string;
  side: ChatSide;
  initial?: ChatPageView;
  canReply?: boolean;
  emptyNote: string;
}

function dayOf(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short" }).format(new Date(value));
}

export function ChatConversation({ threadId, side, initial, canReply = true, emptyNote }: ConversationProps) {
  const user = useCurrentUser();
  const locale = localeFor(user.countryCode);
  const page = useThreadPage(threadId, initial);
  const earlier = useEarlierMessages(threadId);
  const { pending, send, retry, discard } = useSendMessage(threadId);
  const otherSide: ChatSide = side === "CUSTOMER" ? "TEAM" : "CUSTOMER";
  const { typing, announce } = useTyping(threadId, otherSide);
  const connected = useChatConnected();
  const [replyTo, setReplyTo] = useState<ChatMessageView | null>(null);
  const messages = page.data?.messages ?? [];
  const latestFromOther = [...messages].reverse().find((message) => message.side === otherSide)?.id ?? null;
  useMarkRead(threadId, latestFromOther);
  const scroller = useBottomAnchor(messages.length + pending.length, typing);
  const seenAt = page.data?.thread.otherSideReadAt ?? null;
  const lastMine = [...messages].reverse().find((message) => message.side === side);

  if (!page.data) {
    return page.isError ? <FormAlert message="We couldn't load these messages. Try again shortly." /> : <SkeletonLines lines={5} />;
  }

  const jumpTo = (id: string) => document.getElementById(`chat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 text-meta text-ink-soft">
        <span className="font-mono">{page.data.thread.reference}</span>
        <span className="flex items-center gap-1.5" role="status">
          <span aria-hidden className={cn("h-2 w-2 rounded-full", connected ? "bg-lime" : "bg-yellow")} />
          {connected ? "Live" : "Reconnecting…"}
        </span>
      </div>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5" aria-live="polite">
        {page.data.hasMore ? (
          <div className="mb-3 flex justify-center">
            <Button variant="ghost" loading={earlier.loading} onClick={() => messages[0] && void earlier.load(messages[0].createdAt)}>
              Show earlier messages
            </Button>
          </div>
        ) : null}
        {messages.length === 0 && pending.length === 0 ? <p className="py-10 text-center text-small text-ink-soft">{emptyNote}</p> : null}
        <ol className="flex flex-col gap-2">
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const newDay = !previous || dayOf(previous.createdAt, locale) !== dayOf(message.createdAt, locale);
            return (
              <li key={message.id} id={`chat-${message.id}`} className="flex flex-col">
                {newDay ? <p className="my-2 text-center text-meta text-ink-faint">{dayOf(message.createdAt, locale)}</p> : null}
                <Bubble
                  message={message}
                  mine={message.side === side}
                  locale={locale}
                  audience={side}
                  seen={message === lastMine && seenAt !== null && seenAt >= message.createdAt}
                  onReply={canReply ? () => setReplyTo(message) : undefined}
                  onJump={jumpTo}
                />
              </li>
            );
          })}
          {pending.map((message) => (
            <li key={message.clientId} className="flex flex-col">
              <PendingBubble message={message} onRetry={() => void retry(message)} onDiscard={() => discard(message.clientId)} />
            </li>
          ))}
        </ol>
        {typing ? <p className="mt-2 text-meta text-ink-soft">{side === "CUSTOMER" ? "Our team is typing…" : "Typing…"}</p> : null}
      </div>
      {canReply ? (
        <Composer
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onTyping={announce}
          onSend={(body) => {
            send(body, replyTo);
            setReplyTo(null);
          }}
        />
      ) : (
        <p className="border-t border-line px-5 py-3 text-small text-ink-soft">You can read these messages, but replying needs a support role.</p>
      )}
    </div>
  );
}

function useBottomAnchor(count: number, typing: boolean) {
  const scroller = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  useEffect(() => {
    const element = scroller.current;
    if (!element) {
      return;
    }
    const onScroll = () => {
      pinned.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    };
    element.addEventListener("scroll", onScroll);
    return () => element.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element && pinned.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [count, typing]);
  return scroller;
}
