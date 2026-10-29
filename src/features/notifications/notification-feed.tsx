"use client";

import type { NotificationView } from "@/shared";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";

import { useMarkRead } from "./use-notifications";

function timeAgo(createdAt: string): string {
  const minutes = Math.floor((Date.now() - Date.parse(createdAt)) / 60_000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  return hours < 48 ? `${hours} h ago` : `${Math.floor(hours / 24)} days ago`;
}

export function NotificationFeed({ items, unread, onNavigate }: { items: NotificationView[]; unread: number; onNavigate: () => void }) {
  const router = useRouter();
  const mark = useMarkRead();

  function open(item: NotificationView) {
    if (!item.read) {
      mark.mutate(item.id);
    }
    if (item.href) {
      onNavigate();
      router.push(item.href);
    }
  }

  return (
    <section aria-label="Messages">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-label uppercase text-ink-faint">Messages</p>
        {unread > 0 ? (
          <button type="button" className="text-meta font-medium underline underline-offset-4" onClick={() => mark.mutate("all")}>
            Mark all read
          </button>
        ) : null}
      </div>
      <ul className="stagger max-h-[min(300px,calc(100dvh-220px))] overflow-y-auto py-1">
        {items.map((item) => (
          <li key={item.id} className="motion-rise">
            <button type="button" onClick={() => open(item)} className="flex w-full gap-3 px-4 py-2.5 text-left hover:bg-cream">
              <span aria-hidden className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", item.read ? "bg-line-strong" : "bg-orange")} />
              <span className="min-w-0 break-words">
                <span className={cn("block text-small", item.read ? "text-ink-soft" : "font-medium")}>{item.title}</span>
                <span className="line-clamp-2 text-meta font-normal text-ink-faint">{item.body}</span>
                <span className="text-meta font-normal text-ink-faint">{timeAgo(item.createdAt)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
