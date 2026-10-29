"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { NotificationFeed } from "@/features/notifications/notification-feed";
import { useNotifications } from "@/features/notifications/use-notifications";
import { cn } from "@/lib/cn";
import { markToastsSeen, type ToastTone } from "@/lib/toast/toast-store";
import { useToasts } from "@/lib/toast/toaster";

const DOT: Record<ToastTone, string> = { success: "bg-lime", error: "bg-pink", info: "bg-sky" };

function timeAgo(createdAt: number): string {
  const minutes = Math.floor((Date.now() - createdAt) / 60_000);
  return minutes < 1 ? "Just now" : minutes < 60 ? `${minutes} min ago` : `${Math.floor(minutes / 60)} h ago`;
}

export function ActivityBell() {
  const { history, unseen: unseenToasts } = useToasts();
  const feed = useNotifications();
  const messages = feed.data?.items ?? [];
  const unseen = unseenToasts + (feed.data?.unread ?? 0);
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    markToastsSeen();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => !panel.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, history.length]);

  return (
    <div ref={panel} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unseen > 0 ? `Activity, ${unseen} new` : "Activity"}
        onClick={() => setOpen((value) => !value)}
        className={cn("motion-press relative grid h-11 w-11 place-items-center rounded-nav border-[1.5px] bg-paper hover:border-ink", open ? "border-ink" : "border-line-strong")}
      >
        <Icon name="bell" className={cn("h-5 w-5", unseen > 0 && "origin-top animate-[wobble_700ms_var(--ease-out)]")} />
        {unseen > 0 ? (
          <span key={unseen} className="motion-pop absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-orange px-1 text-[11px] font-semibold text-cocoa">
            {unseen}
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Recent activity"
          className="fixed inset-x-4 top-[72px] z-40 flex max-h-[calc(100dvh-88px)] flex-col overflow-hidden rounded-card border border-line bg-paper shadow-frame [animation:popover-in_var(--dur)_var(--ease-out)_both] sm:absolute sm:inset-x-auto sm:right-0 sm:top-[52px] sm:w-[360px] sm:origin-top-right"
        >
          {messages.length > 0 ? <NotificationFeed items={messages} unread={feed.data?.unread ?? 0} onNavigate={() => setOpen(false)} /> : null}
          {history.length > 0 ? <p className="border-y border-line px-4 py-3 text-label uppercase text-ink-faint">This session</p> : null}
          {history.length === 0 && messages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-7 text-center">
              <img src="/brand/sticker-clover.svg" alt="" aria-hidden className="motion-pop h-12 w-12 -rotate-[8deg]" />
              <p className="text-small font-medium">You&apos;re all caught up</p>
              <p className="text-meta font-normal text-ink-faint">Messages about your account and what you do here show up in this list.</p>
            </div>
          ) : history.length === 0 ? null : (
            <ul className="stagger max-h-[240px] min-h-0 overflow-y-auto py-1">
              {history.map((item) => (
                <li key={item.id} className="motion-rise flex gap-3 px-4 py-2.5">
                  <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", DOT[item.tone])} />
                  <span className="min-w-0">
                    <span className="block text-small font-medium">{item.title}</span>
                    <span className="text-meta font-normal text-ink-faint">{timeAgo(item.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
