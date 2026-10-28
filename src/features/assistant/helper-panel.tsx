"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { ASSISTANT } from "./assistant-identity";
import type { ChatMessage, HelperAction } from "./conversation/messages";
import { PosyAvatar } from "./flower-avatar";
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
  const last = helper.messages.at(-1);
  if (last?.from === "person") {
    return null;
  }
  const shown = new Set(last?.actions?.map((action) => action.label));
  const suggestions = [
    ...(helper.field && helper.page && fieldFor(helper.page, helper.field) ? [{ kind: "explain-field" as const, field: helper.field, label: `What's "${helper.field}"?` }] : []),
    ...(helper.page ? [{ kind: "explain-page" as const, label: "Explain this page" }] : []),
    { kind: "ask-team" as const, label: "Ask our team" },
  ].filter((action) => !shown.has(action.label));
  if (suggestions.length === 0) {
    return null;
  }
  return (
    <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 pt-1">
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
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onOutside = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest("[data-assistant]") || document.querySelector(".helper-highlight")) {
        return;
      }
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, [open, close]);

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
      className="helper-panel-enter fixed inset-x-0 bottom-[max(88px,14dvh)] z-50 mx-auto flex h-[min(52dvh,380px)] w-[min(320px,calc(100vw-48px))] origin-bottom flex-col overflow-hidden rounded-[20px] bg-paper shadow-frame ring-[1.5px] ring-line sm:inset-x-auto sm:bottom-5 sm:right-5 sm:mx-0 sm:h-[min(460px,calc(100dvh-120px))] sm:w-[340px] sm:origin-bottom-right print:hidden"
    >
      <header className="flex items-center gap-2.5 border-b border-line bg-yellow px-3 py-2">
        <PosyAvatar mood={helper.mood} size={30} />
        <p className="flex-1 text-[16px] font-semibold leading-tight">
          {ASSISTANT.name}
          {helper.busy ? <span className="ml-2 text-meta font-normal text-ink-soft">One moment…</span> : null}
        </p>
        {helper.voice.canSpeak ? (
          <button
            type="button"
            onClick={() => helper.voice.choose(!helper.voice.on)}
            aria-pressed={helper.voice.on}
            aria-label={helper.voice.on ? "Stop reading answers aloud" : "Read answers aloud"}
            className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-paper aria-pressed:bg-ink aria-pressed:text-on-ink"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              {helper.voice.on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : null}
            </svg>
          </button>
        ) : null}
        <button type="button" onClick={close} aria-label="Close helper" className="grid h-8 w-8 place-items-center rounded-full text-[20px] text-ink-soft hover:bg-paper">
          ×
        </button>
      </header>
      {helper.voice.on && helper.voice.voices.length > 1 ? (
        <div className="flex items-center gap-2 border-b border-line bg-paper-sunk px-3 py-1.5 text-meta">
          <label htmlFor="helper-voice" className="text-ink-soft">
            Voice
          </label>
          <select
            id="helper-voice"
            value={helper.voice.voiceName ?? ""}
            onChange={(event) => helper.voice.pickVoice(event.target.value)}
            className="min-w-0 flex-1 truncate rounded-[8px] border border-line bg-paper px-2 py-1 text-meta text-ink"
          >
            {helper.voice.voices.map((option) => (
              <option key={option.name} value={option.name}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <ol aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 py-3">
        {messages.map((message) => (
          <Bubble key={message.id} message={message} onAct={helper.act} />
        ))}
        <li ref={end} aria-hidden />
      </ol>
      <Suggestions helper={helper} />
      <form onSubmit={submit} className="flex items-center gap-1.5 border-t border-line px-2.5 py-2.5">
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
          className="h-10 min-w-0 flex-1 rounded-chip border-[1.5px] border-line-strong bg-ground px-3.5 text-base text-ink outline-none placeholder:text-ink-faint focus:border-ink sm:text-[15px]"
        />
        {helper.voice.canListen ? (
          <button
            type="button"
            onClick={() => helper.voice.hear((text) => helper.ask(text))}
            aria-label={helper.voice.listening ? "Listening" : "Speak your question"}
            aria-pressed={helper.voice.listening}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft ring-[1.5px] ring-line hover:bg-paper-sunk aria-pressed:bg-magenta aria-pressed:text-on-ink aria-pressed:ring-magenta"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="9" y="3" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        ) : null}
        <button
          type="submit"
          aria-label="Send"
          disabled={!draft.trim() || helper.busy}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-on-ink transition-opacity disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </form>
    </section>
  );
}
