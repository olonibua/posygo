"use client";

import { useEffect, useRef } from "react";

import { type ApiFailure, onApiFailure } from "@/lib/api/client";

import type { NoticedError } from "../conversation/replies";
import { fieldLabelOf, rejectedFieldLabels } from "./field-label";
import { HesitationTracker } from "./hesitation";
import { trail } from "./trail";

const TICK_MS = 5_000;
const SETTLE_MS = 60;

export interface PageSignalHandlers {
  onStuck: (field: string) => void;
  onError: (error: NoticedError) => void;
  onField: (field: string | null) => void;
}

function worthNoticing(failure: ApiFailure): boolean {
  if (failure.endpoint.includes("/support-cases")) {
    return false;
  }
  if (failure.error.status === 401 && failure.error.code !== "invalid_credentials") {
    return false;
  }
  return failure.method !== "GET" || failure.error.status >= 500 || failure.error.status === 0;
}

export function usePageSignals(handlers: PageSignalHandlers): void {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const tracker = new HesitationTracker();
    const focusIn = (event: FocusEvent) => {
      const label = fieldLabelOf(event.target);
      latest.current.onField(label);
      if (label) {
        tracker.focused(label, Date.now());
      }
    };
    const input = (event: Event) => {
      const label = fieldLabelOf(event.target);
      if (label) {
        tracker.edited(label, Date.now());
      }
    };
    const focusOut = () => tracker.left();
    const tick = window.setInterval(() => {
      const stuck = tracker.stuckOn(Date.now());
      if (stuck) {
        latest.current.onStuck(stuck);
      }
    }, TICK_MS);
    const stopListening = onApiFailure((failure) => {
      if (!worthNoticing(failure)) {
        return;
      }
      trail.add(`Got "${failure.error.code}" from ${failure.method} ${failure.endpoint}`);
      window.setTimeout(() => {
        const rejected = rejectedFieldLabels(document);
        const repeated = rejected.map((label) => tracker.fieldRejected(label, Date.now())).find(Boolean);
        const { status, code, message, correlationId } = failure.error;
        latest.current.onError({ code, status, message, correlationId, endpoint: failure.endpoint, rejectedFields: rejected });
        if (repeated) {
          latest.current.onStuck(repeated);
        }
      }, SETTLE_MS);
    });
    const alreadyOn = fieldLabelOf(document.activeElement);
    if (alreadyOn) {
      latest.current.onField(alreadyOn);
      tracker.focused(alreadyOn, Date.now());
    }
    document.addEventListener("focusin", focusIn);
    document.addEventListener("focusout", focusOut);
    document.addEventListener("input", input);
    return () => {
      stopListening();
      window.clearInterval(tick);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("focusout", focusOut);
      document.removeEventListener("input", input);
    };
  }, []);
}
