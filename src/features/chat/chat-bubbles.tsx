"use client";

import type { ChatMessageView, ChatSide } from "@/shared";
import Link from "next/link";

import { useCurrentUser } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast/toast-store";

import { referenceHref } from "./chat-references";
import type { PendingMessage } from "./use-chat";

function timeOf(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function MessageText({ text, references, audience }: { text: string; references: readonly string[]; audience: ChatSide }) {
  const user = useCurrentUser();
  if (references.length === 0) {
    return <>{text}</>;
  }
  const pattern = new RegExp(`(${references.map((reference) => reference.replace(/[-]/g, "\\-")).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, index) => {
        const reference = references.find((candidate) => candidate === part.toUpperCase());
        if (!reference) {
          return <span key={index}>{part}</span>;
        }
        const href = referenceHref(reference, audience, user);
        const copy = () => void navigator.clipboard?.writeText(reference).then(() => toast.success(`${reference} copied`));
        return href ? (
          <Link key={index} href={href} className="rounded bg-paper/70 px-1 font-mono text-[0.92em]">
            {reference}
          </Link>
        ) : (
          <button key={index} type="button" onClick={copy} title="Copy" className="rounded bg-paper/70 px-1 font-mono text-[0.92em] underline decoration-dotted">
            {reference}
          </button>
        );
      })}
    </>
  );
}

interface BubbleProps {
  message: ChatMessageView;
  mine: boolean;
  locale: string;
  audience: ChatSide;
  seen: boolean;
  onReply?: () => void;
  onJump: (id: string) => void;
}

export function Bubble({ message, mine, locale, audience, seen, onReply, onJump }: BubbleProps) {
  return (
    <div className={cn("group flex max-w-[82%] flex-col gap-1 sm:max-w-[70%]", mine ? "items-end self-end" : "items-start self-start")}>
      <span className="px-1 text-meta text-ink-faint">
        {mine ? "You" : message.authorLabel} · {timeOf(message.createdAt, locale)}
      </span>
      <div className={cn("rounded-card px-3.5 py-2.5 text-small leading-[21px]", mine ? "bg-lime text-ink" : "border border-line bg-paper")}>
        {message.replyTo ? (
          <button type="button" onClick={() => onJump(message.replyTo!.id)} className="mb-1.5 block w-full border-l-2 border-ink/30 pl-2 text-left text-meta text-ink-soft">
            {message.replyTo.body}
          </button>
        ) : null}
        <p className="whitespace-pre-wrap break-words">
          <MessageText text={message.body} references={message.references} audience={audience} />
        </p>
      </div>
      <div className="flex items-center gap-2 px-1">
        {onReply ? (
          <button type="button" onClick={onReply} className="text-meta text-ink-soft opacity-100 hover:text-ink sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100">
            Reply
          </button>
        ) : null}
        {seen ? <span className="text-meta text-ink-faint">Seen</span> : null}
      </div>
    </div>
  );
}

export function PendingBubble({ message, onRetry, onDiscard }: { message: PendingMessage; onRetry: () => void; onDiscard: () => void }) {
  return (
    <div className="flex max-w-[82%] flex-col items-end gap-1 self-end sm:max-w-[70%]">
      <div className={cn("rounded-card bg-lime px-3.5 py-2.5 text-small leading-[21px]", message.failed ? "opacity-100 ring-2 ring-danger" : "opacity-60")}>
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
      {message.failed ? (
        <span className="flex items-center gap-2 px-1 text-meta">
          <span className="text-danger">{message.failed}</span>
          <button type="button" onClick={onRetry} className="text-ink underline">
            Try again
          </button>
          <button type="button" onClick={onDiscard} className="text-ink-soft underline">
            Remove
          </button>
        </span>
      ) : (
        <span className="px-1 text-meta text-ink-faint">Sending…</span>
      )}
    </div>
  );
}
