"use client";

import { useQuery } from "@tanstack/react-query";
import { type MutableRefObject, useCallback, useRef } from "react";

import { askForAnswer, fetchAnswerStatus } from "./answers-client";
import { type ChatMessage, helperSays, personSays } from "./conversation/messages";
import { errorReply, fieldReply, type NoticedError, pageReply, understand, unsureReply } from "./conversation/replies";
import type { PageKnowledge } from "./knowledge/types";
import { readScreen } from "./signals/screen";
import { trail } from "./signals/trail";
import { askTeam } from "./support-client";

type Awaiting = { kind: "question" } | { kind: "email"; question: string } | null;
export type Mood = "rest" | "notice" | "think" | "talk" | "happy";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface QuestionContext {
  pathname: string;
  page: PageKnowledge | undefined;
  signedIn: boolean;
  open: boolean;
  messages: readonly ChatMessage[];
  lastError: MutableRefObject<NoticedError | null>;
  referenceFor: (error: NoticedError) => string | null;
  speak: (...replies: ChatMessage[]) => void;
  hear: (message: ChatMessage) => void;
  setMood: (mood: Mood, settleAfter?: number) => void;
  setBusy: (busy: boolean) => void;
  withFixes: (reply: ChatMessage, fields: readonly string[]) => ChatMessage;
}

export function useQuestions(context: QuestionContext) {
  const awaiting = useRef<Awaiting>(null);
  const lastQuestion = useRef<string | null>(null);
  const status = useQuery({ queryKey: ["assistant", "status"], queryFn: fetchAnswerStatus, enabled: context.open, staleTime: Infinity, retry: false });
  const { pathname, page, signedIn, messages, lastError, referenceFor, speak, hear, setMood, setBusy, withFixes } = context;

  const submitQuestion = useCallback(
    async (question: string, contactEmail?: string) => {
      awaiting.current = null;
      setBusy(true);
      setMood("think");
      try {
        const result = await askTeam({ page: pathname, trail: trail.recent(), signedIn }, question, contactEmail);
        lastQuestion.current = null;
        setMood("happy", 1_800);
        speak(helperSays(`Sent. Your case number is ${result.reference}. ${signedIn ? "The answer will appear in your notifications." : "We'll reply by email."}`));
      } catch {
        setMood("rest");
        speak(helperSays("I couldn't send that just now. Please try again in a minute."));
      } finally {
        setBusy(false);
      }
    },
    [pathname, setBusy, setMood, signedIn, speak],
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

  const answerOpenQuestion = useCallback(
    async (question: string, fallback: ChatMessage = unsureReply(), fields: readonly string[] = []) => {
      lastQuestion.current = question;
      if (!status.data?.answers) {
        speak(fallback);
        return;
      }
      setBusy(true);
      setMood("think");
      try {
        const reply = await askForAnswer(pathname, question, messages, signedIn, readScreen());
        if (reply.answer) {
          lastQuestion.current = null;
          speak(withFixes(helperSays(reply.answer, [{ kind: "ask-team", label: "Still need a person?" }]), fields));
        } else {
          speak(fallback);
        }
      } catch {
        speak(fallback);
      } finally {
        setBusy(false);
      }
    },
    [messages, pathname, setBusy, setMood, signedIn, speak, status.data?.answers, withFixes],
  );

  const explain = useCallback(
    (question: string, fallback: ChatMessage, fields: readonly string[] = []) => {
      void answerOpenQuestion(question, withFixes(fallback, fields), fields);
    },
    [answerOpenQuestion, withFixes],
  );

  const ask = useCallback(
    (text: string) => {
      const said = text.trim().slice(0, 500);
      if (!said) {
        return;
      }
      hear(personSays(said));
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
        explain(said, fieldReply(intent.label, page), [intent.label]);
      } else if (intent.kind === "page" && page) {
        explain(said, pageReply(page));
      } else if (intent.kind === "error" && lastError.current) {
        speak(withFixes(errorReply(lastError.current, referenceFor(lastError.current)), lastError.current.rejectedFields));
      } else if (intent.kind === "team") {
        startQuestion(null);
      } else {
        void answerOpenQuestion(said);
      }
    },
    [answerOpenQuestion, explain, hear, lastError, page, referenceFor, speak, startQuestion, submitQuestion, withFixes],
  );

  return { ask, explain, askTeam: () => startQuestion(lastQuestion.current) };
}
