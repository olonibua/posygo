"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { ASSISTANT } from "./assistant-identity";
import type { ChatMessage, HelperAction } from "./conversation/messages";
import { FlowerAvatar } from "./flower-avatar";
import { fieldFor } from "./knowledge/types";
import type { AssistantState } from "./use-assistant";

const CHIP =
  "shrink-0 whitespace-nowrap rounded-chip bg-paper px-3 py-1.5 text-meta font-medium text-ink ring-[1.5px] ring-line transition-colors duration-150 hover:bg-yellow hover:ring-ink no-underline";

function ActionChip({ action, onAct }: { action: HelperAction; onAct: (action: HelperAction) => void }) {
  if (action.kind === "link") {
    return (
      <Link href={action.href} className={CHIP}>
        {action.label} →
      </Link>
    );
  }
  return (
    <button type="button" className={CHIP} onClick={() => onAct(action)}>
      {action.label}
    </button>
  );
}

function Bubble({ message, onAct }: { message: ChatMessage; onAct: (action: HelperAction) => void }) {
  const mine = message.from === "person";
  return (
    <li className={mine ? "flex justify-end" : "flex flex-col items-start gap-2"}>
      <p
        className={
          mine
            ? "motion-rise max-w-[85%] whitespace-pre-line rounded-[16px] rounded-br-[6px] bg-ink px-3.5 py-2.5 text-small text-on-ink"
            : "motion-rise max-w-[92%] whitespace-pre-line rounded-[16px] rounded-bl-[6px] bg-paper-sunk px-3.5 py-2.5 text-small text-ink"
        }
      >
        {message.text}
      </p>
      {message.actions?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {message.actions.map((action) => (
            <ActionChip key={`${action.kind}-${action.label}`} action={action} onAct={onAct} />
          ))}
        </div>
      ) : null}
    </li>
  );
}

function Suggestions({ helper }: { helper: AssistantState }) {
  const suggestions: HelperAction[] = [
    ...(helper.field && helper.page && fieldFor(helper.page, helper.field) ? [{ kind: "explain-field" as const, field: helper.field, label: `What's "${helper.field}"?` }] : []),
    ...(helper.page ? [{ kind: "explain-page" as const, label: "Explain this page" }] : []),
    { kind: "ask-team", label: "Ask our team" },
  ];
  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 pt-1">
      {suggestions.map((action) => (
        <ActionChip key={action.label} action={action} onAct={helper.act} />
      ))}
    </div>
  );
}

export function HelperPanel({ helper }: { helper: AssistantState }) {
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLLIElement>(null);
  const { open, close, messages } = helper;

  useEffect(() => {
    if (open) {
      input.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  if (!open) {
    return null;
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    helper.ask(draft);
    setDraft("");
  }

  return (
    <section
      data-assistant
      role="dialog"
      aria-label={`${ASSISTANT.name}, your helper`}
      className="helper-panel-enter fixed bottom-4 left-4 z-50 flex h-[min(600px,calc(100dvh-32px))] w-[min(400px,calc(100vw-32px))] origin-bottom-left flex-col overflow-hidden rounded-[22px] bg-paper shadow-frame ring-[1.5px] ring-line print:hidden"
    >
      <header className="flex items-center gap-3 border-b border-line bg-yellow px-4 py-3">
        <FlowerAvatar mood={helper.mood} size={44} />
        <div className="flex-1">
          <p className="text-[17px] font-semibold leading-tight">{ASSISTANT.name}</p>
          <p className="text-meta text-ink-soft">{helper.busy ? "Sending…" : ASSISTANT.role}</p>
        </div>
        <button type="button" onClick={close} aria-label="Close helper" className="grid h-9 w-9 place-items-center rounded-full text-[20px] text-ink-soft hover:bg-paper-sunk">
          ×
        </button>
      </header>
      <ol aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <Bubble key={message.id} message={message} onAct={helper.act} />
        ))}
        <li ref={end} aria-hidden />
      </ol>
      <Suggestions helper={helper} />
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-3">
        <label htmlFor="helper-message" className="sr-only">
          Message {ASSISTANT.name}
        </label>
        <input
          id="helper-message"
          ref={input}
          value={draft}
          maxLength={1000}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about this page…"
          className="h-11 flex-1 rounded-chip border-[1.5px] border-line-strong bg-ground px-3.5 text-base text-ink outline-none placeholder:text-ink-faint focus:border-ink sm:text-[15px]"
        />
        <button type="submit" disabled={!draft.trim() || helper.busy} className="h-11 rounded-chip bg-ink px-4 text-small font-medium text-on-ink transition-opacity disabled:opacity-40">
          Send
        </button>
      </form>
    </section>
  );
}
