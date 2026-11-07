"use client";

import { CHAT_MESSAGE_MAX, type ChatMessageView } from "@/shared";
import { type FormEvent, type KeyboardEvent, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-controls";

const MAX_INPUT_HEIGHT = 140;

export function Composer({ replyTo, onCancelReply, onSend, onTyping }: { replyTo: ChatMessageView | null; onCancelReply: () => void; onSend: (body: string) => void; onTyping: () => void }) {
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (replyTo) {
      input.current?.focus();
    }
  }, [replyTo]);

  useLayoutEffect(() => {
    const element = input.current;
    if (element) {
      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight + 3, MAX_INPUT_HEIGHT)}px`;
    }
  }, [text]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const body = text.trim();
    if (!body) {
      return;
    }
    onSend(body);
    setText("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 border-t border-line px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      {replyTo ? (
        <div className="flex items-start justify-between gap-3 rounded-card bg-paper-sunk px-3 py-2 text-meta">
          <span className="line-clamp-2 border-l-2 border-ink/30 pl-2 text-ink-soft">
            Replying to {replyTo.authorLabel}: {replyTo.body}
          </span>
          <button type="button" onClick={onCancelReply} className="shrink-0 text-ink-soft underline">
            Cancel
          </button>
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <Textarea
          id="chat-message"
          ref={input}
          rows={1}
          maxLength={CHAT_MESSAGE_MAX}
          value={text}
          placeholder="Write a message"
          className="h-11 min-h-11 flex-1 resize-none py-[9px]"
          onKeyDown={onKeyDown}
          onChange={(event) => {
            setText(event.target.value);
            onTyping();
          }}
        />
        <Button type="submit" variant="yellow" className="h-11 shrink-0 px-4" disabled={!text.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
}
