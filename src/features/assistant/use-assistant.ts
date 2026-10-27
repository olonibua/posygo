"use client";

import { errorGuide } from "@/shared";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

import { type ChatMessage, type HelperAction, helperSays, personSays } from "./conversation/messages";
import { errorNudge, errorReply, fieldReply, greeting, type NoticedError, pageReply, stuckNudge, understand, unsureReply } from "./conversation/replies";
import { knowledgeFor } from "./knowledge/registry";
import { isQuietPage, quietPage } from "./signals/quiet-pages";
import { trail } from "./signals/trail";
import { usePageSignals } from "./signals/use-page-signals";
import { askTeam, reportError } from "./support-client";

export type Mood = "rest" | "notice" | "think" | "talk" | "happy";
export type Nudge = { kind: "stuck"; field: string; text: string } | { kind: "error"; error: NoticedError; text: string };
type Awaiting = { kind: "question" } | { kind: "email"; question: string } | null;

const TALK_MS = 1_800;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useAssistant() {
  const pathname = usePathname();
  const page = knowledgeFor(pathname);
  const { state } = useAuth();
  const signedIn = state.status === "authenticated";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [mood, setMood] = useState<Mood>("rest");
  const [busy, setBusy] = useState(false);
  const [field, setField] = useState<string | null>(null);
  const lastError = useRef<NoticedError | null>(null);
  const references = useRef(new Map<string, string>());
  const awaiting = useRef<Awaiting>(null);
  const lastQuestion = useRef<string | null>(null);
  const settle = useRef<number | undefined>(undefined);

  const settleTo = useCallback((next: Mood, after = TALK_MS) => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setMood(next), after);
  }, []);

  const speak = useCallback(
    (...replies: ChatMessage[]) => {
      setMessages((current) => [...current, ...replies].slice(-60));
      setMood("talk");
      settleTo("rest");
    },
    [settleTo],
  );

  const draft = useCallback(() => ({ page: pathname, trail: trail.recent(), signedIn }), [pathname, signedIn]);

  const report = useCallback(
    async (error: NoticedError): Promise<string | null> => {
      const key = `${error.code}|${error.endpoint}`;
      const known = references.current.get(key);
      if (known) {
        return known;
      }
      setMood("think");
      try {
        const result = await reportError(draft(), error);
        references.current.set(key, result.reference);
        setMood("happy");
        settleTo("rest");
        return result.reference;
      } catch {
        setMood("rest");
        return null;
      }
    },
    [draft, settleTo],
  );

  const onError = useCallback(
    async (error: NoticedError) => {
      lastError.current = error;
      const guide = errorGuide(error.code, error.status);
      const reference = guide.side === "SYSTEM" && error.code !== "network_error" ? await report(error) : null;
      if (open) {
        speak(errorReply(error, reference));
        return;
      }
      setNudge({ kind: "error", error, text: errorNudge(error, reference) });
      setMood("notice");
    },
    [open, report, speak],
  );

  const onStuck = useCallback(
    (stuckOn: string) => {
      if (open || (page && isQuietPage(page.route))) {
        return;
      }
      setNudge((current) => current ?? { kind: "stuck", field: stuckOn, text: stuckNudge(stuckOn) });
      setMood("notice");
    },
    [open, page],
  );

  usePageSignals(pathname, page?.title, { onStuck, onError: (error) => void onError(error), onField: (label) => label && setField(label) });

  useEffect(() => {
    setNudge(null);
    setField(null);
    lastError.current = null;
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  const openPanel = useCallback(() => {
    setOpen(true);
    setNudge(null);
    setMessages((current) => (current.length > 0 ? current : [greeting(page)]));
  }, [page]);

  const acceptNudge = useCallback(() => {
    const current = nudge;
    openPanel();
    if (current?.kind === "stuck") {
      speak(fieldReply(current.field, page));
    } else if (current) {
      speak(errorReply(current.error, references.current.get(`${current.error.code}|${current.error.endpoint}`) ?? null));
    }
  }, [nudge, openPanel, page, speak]);

  const submitQuestion = useCallback(
    async (question: string, contactEmail?: string) => {
      awaiting.current = null;
      setBusy(true);
      setMood("think");
      try {
        const result = await askTeam(draft(), question, contactEmail);
        lastQuestion.current = null;
        setMood("happy");
        settleTo("rest");
        speak(helperSays(`Sent. Your case number is ${result.reference}. ${signedIn ? "The answer will appear in your notifications." : "We'll reply by email."}`));
      } catch {
        speak(helperSays("I couldn't send that just now. Please try again in a minute."));
      } finally {
        setBusy(false);
      }
    },
    [draft, settleTo, signedIn, speak],
  );

  const startQuestion = useCallback(
    (question: string | null) => {
      if (!question) {
        awaiting.current = { kind: "question" };
        speak(helperSays("Sure. What should I tell our team?"));
      } else if (!signedIn) {
        awaiting.current = { kind: "email", question };
        speak(helperSays("Which email should they reply to?"));
      } else {
        void submitQuestion(question);
      }
    },
    [signedIn, speak, submitQuestion],
  );

  const act = useCallback(
    (action: HelperAction) => {
      if (action.kind === "explain-page" && page) {
        speak(pageReply(page));
      } else if (action.kind === "explain-field") {
        speak(fieldReply(action.field, page));
      } else if (action.kind === "ask-team") {
        startQuestion(lastQuestion.current);
      } else if (action.kind === "report-error" && lastError.current) {
        const error = lastError.current;
        void report(error).then((reference) =>
          speak(
            reference
              ? helperSays(`Done. Your case number is ${reference}, and our team can see exactly what happened.`)
              : helperSays("I couldn't reach our team just now. Please try again in a minute."),
          ),
        );
      }
    },
    [page, report, speak, startQuestion],
  );

  const ask = useCallback(
    (text: string) => {
      const said = text.trim().slice(0, 1000);
      if (!said) {
        return;
      }
      setMessages((current) => [...current, personSays(said)]);
      const waiting = awaiting.current;
      if (waiting?.kind === "email") {
        if (EMAIL.test(said)) {
          void submitQuestion(waiting.question, said.toLowerCase());
        } else {
          speak(helperSays("That doesn't look like an email address. Could you check it?"));
        }
        return;
      }
      if (waiting?.kind === "question") {
        startQuestion(said);
        return;
      }
      const intent = understand(said, page, lastError.current !== null);
      if (intent.kind === "field") {
        speak(fieldReply(intent.label, page));
      } else if (intent.kind === "page" && page) {
        speak(pageReply(page));
      } else if (intent.kind === "error" && lastError.current) {
        speak(errorReply(lastError.current, references.current.get(`${lastError.current.code}|${lastError.current.endpoint}`) ?? null));
      } else if (intent.kind === "team") {
        startQuestion(null);
      } else {
        lastQuestion.current = said;
        speak(unsureReply());
      }
    },
    [page, speak, startQuestion, submitQuestion],
  );

  return {
    open,
    mood,
    nudge,
    messages,
    busy,
    page,
    field,
    openPanel,
    close: () => setOpen(false),
    acceptNudge,
    dismissNudge: () => {
      setNudge(null);
      setMood("rest");
    },
    quietHere: () => {
      if (page) {
        quietPage(page.route);
      }
      setNudge(null);
      setMood("rest");
    },
    act,
    ask,
  };
}

export type AssistantState = ReturnType<typeof useAssistant>;
