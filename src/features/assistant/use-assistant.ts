"use client";

import { errorGuide } from "@/shared";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";

import { type ChatMessage, type HelperAction, helperSays } from "./conversation/messages";
import { errorNudge, errorReply, fieldReply, greeting, type NoticedError, pageReply, stuckNudge, voiceChoice } from "./conversation/replies";
import { useGuidance } from "./guidance/use-guidance";
import { knowledgeFor } from "./knowledge/registry";
import { isQuietPage, quietPage } from "./signals/quiet-pages";
import { trail } from "./signals/trail";
import { usePageSignals } from "./signals/use-page-signals";
import { reportError } from "./support-client";
import { type Mood, useQuestions } from "./use-questions";
import { useVoice } from "./voice/use-voice";

export type { Mood } from "./use-questions";
export type Nudge = { kind: "stuck"; field: string; text: string } | { kind: "error"; error: NoticedError; text: string };

const TALK_MS = 1_800;
const errorKey = (error: NoticedError) => `${error.code}|${error.endpoint}`;

export function useAssistant() {
  const pathname = usePathname();
  const page = knowledgeFor(pathname);
  const { state } = useAuth();
  const signedIn = state.status === "authenticated";
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [mood, setMoodNow] = useState<Mood>("rest");
  const [busy, setBusy] = useState(false);
  const [field, setField] = useState<string | null>(null);
  const lastError = useRef<NoticedError | null>(null);
  const references = useRef(new Map<string, string>());
  const settle = useRef<number | undefined>(undefined);

  const setMood = useCallback((next: Mood, settleAfter?: number) => {
    window.clearTimeout(settle.current);
    setMoodNow(next);
    if (settleAfter) {
      settle.current = window.setTimeout(() => setMoodNow("rest"), settleAfter);
    }
  }, []);

  const voice = useVoice((speaking) => setMood(speaking ? "talk" : "rest"));
  const voiceSpeak = voice.speak;
  const hear = useCallback((message: ChatMessage) => setMessages((current) => [...current, message].slice(-60)), []);
  const speak = useCallback(
    (...replies: ChatMessage[]) => {
      setMessages((current) => [...current, ...replies].slice(-60));
      setMood("talk", TALK_MS);
      const spoken = replies.filter((reply) => reply.from === "helper").at(-1);
      if (spoken) {
        voiceSpeak(spoken.text);
      }
    },
    [setMood, voiceSpeak],
  );
  const guidance = useGuidance(page, speak);
  const withFixes = useCallback(
    (reply: ChatMessage, fields: readonly string[]): ChatMessage => {
      const fixes = guidance.fixesFor(fields);
      return fixes.length > 0 ? { ...reply, actions: [...fixes, ...(reply.actions ?? [])] } : reply;
    },
    [guidance],
  );
  const referenceFor = useCallback((error: NoticedError) => references.current.get(errorKey(error)) ?? null, []);

  const report = useCallback(
    async (error: NoticedError): Promise<string | null> => {
      const known = referenceFor(error);
      if (known) {
        return known;
      }
      setMood("think");
      try {
        const result = await reportError({ page: pathname, trail: trail.recent(), signedIn }, error);
        references.current.set(errorKey(error), result.reference);
        setMood("happy", TALK_MS);
        return result.reference;
      } catch {
        setMood("rest");
        return null;
      }
    },
    [pathname, referenceFor, setMood, signedIn],
  );

  const onError = useCallback(
    async (error: NoticedError) => {
      lastError.current = error;
      const guide = errorGuide(error.code, error.status);
      const reference = guide.side === "SYSTEM" && error.code !== "network_error" ? await report(error) : null;
      if (open) {
        speak(withFixes(errorReply(error, reference), error.rejectedFields));
        return;
      }
      const text = errorNudge(error, reference);
      setNudge({ kind: "error", error, text });
      setMood("notice");
      voice.speak(text, true);
    },
    [open, report, setMood, speak, voice, withFixes],
  );

  const onStuck = useCallback(
    (stuckOn: string) => {
      if (open || (page && isQuietPage(page.route))) {
        return;
      }
      setNudge((current) => current ?? { kind: "stuck", field: stuckOn, text: stuckNudge(stuckOn) });
      setMood("notice");
      voice.speak(stuckNudge(stuckOn), true);
    },
    [open, page, setMood, voice],
  );

  usePageSignals({ onStuck, onError: (error) => void onError(error), onField: (label) => label && setField(label) });
  const questions = useQuestions({ pathname, page, signedIn, open, messages, lastError, referenceFor, speak, hear, setMood, setBusy, withFixes });

  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) {
      return;
    }
    shownPath.current = pathname;
    setNudge(null);
    setField(null);
    lastError.current = null;
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  const openPanel = useCallback(() => {
    setOpen(true);
    setNudge(null);
    setMessages((current) => (current.length > 0 ? current : voice.undecided ? [greeting(page), voiceChoice()] : [greeting(page)]));
  }, [page, voice.undecided]);

  const acceptNudge = useCallback(() => {
    const current = nudge;
    openPanel();
    if (current?.kind === "stuck") {
      speak(withFixes(fieldReply(current.field, page), [current.field]));
    } else if (current) {
      speak(withFixes(errorReply(current.error, referenceFor(current.error)), current.error.rejectedFields));
    }
  }, [nudge, openPanel, page, referenceFor, speak, withFixes]);

  const act = useCallback(
    (action: HelperAction) => {
      if (action.kind === "explain-page" && page) {
        speak(pageReply(page));
      } else if (action.kind === "explain-field") {
        speak(withFixes(fieldReply(action.field, page), [action.field]));
      } else if (action.kind === "voice") {
        voice.choose(action.on);
        speak(helperSays(action.on ? "Great, I'll talk you through things. You can turn my voice off at the top." : "Typing it is. You can turn my voice on at the top any time."));
      } else if (action.kind === "show-field") {
        guidance.show(action.field);
      } else if (action.kind === "fix-field") {
        guidance.fix(action.field, action.value);
      } else if (action.kind === "tour-start") {
        guidance.startTour();
      } else if (action.kind === "tour-next") {
        guidance.nextStep();
      } else if (action.kind === "tour-stop") {
        guidance.stopTour();
      } else if (action.kind === "ask-team") {
        questions.askTeam();
      } else if (action.kind === "report-error" && lastError.current) {
        void report(lastError.current).then((reference) =>
          speak(
            reference
              ? helperSays(`Done. Your case number is ${reference}, and our team can see exactly what happened.`)
              : helperSays("I couldn't reach our team just now. Please try again in a minute."),
          ),
        );
      }
    },
    [guidance, page, questions, report, speak, voice, withFixes],
  );

  const calm = () => {
    setNudge(null);
    setMood("rest");
  };

  return {
    open,
    mood,
    nudge,
    messages,
    busy,
    page,
    field,
    openPanel,
    close: () => {
      voice.stop();
      setOpen(false);
    },
    voice,
    acceptNudge,
    dismissNudge: calm,
    quietHere: () => {
      if (page) {
        quietPage(page.route);
      }
      calm();
    },
    act,
    ask: questions.ask,
  };
}

export type AssistantState = ReturnType<typeof useAssistant>;
