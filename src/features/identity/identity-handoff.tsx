"use client";

import { useEffect, useRef, useState } from "react";

import { Button, buttonClasses } from "@/components/ui/button";
import { CheckMark } from "@/components/ui/check-mark";
import { FormAlert } from "@/components/ui/form-controls";
import { toneSurface } from "@/components/ui/tone";
import { cn } from "@/lib/cn";

import type { IdentityState } from "./identity-state";
import { useIsDesktop } from "./use-handoff-device";
import { useQrCode } from "./use-qr-code";

const POLL_WHILE_HANDING_OFF_MS = 4_000;
const POLL_EVERY_MS: Partial<Record<IdentityState, number>> = { WAITING: 15_000, IN_REVIEW: 30_000 };

export interface IdentityHandoffProps {
  state: IdentityState;
  reason?: string | null;
  editable: boolean;
  error?: string | null;
  starting: boolean;
  checking: boolean;
  onStart: () => Promise<{ url: string }>;
  onCheck: () => void;
}

function usePolling(every: number | undefined, checking: boolean, onCheck: () => void) {
  const latest = useRef({ checking, onCheck });
  useEffect(() => {
    latest.current = { checking, onCheck };
  });
  useEffect(() => {
    if (!every) {
      return;
    }
    const timer = window.setInterval(() => {
      if (!latest.current.checking && document.visibilityState === "visible") {
        latest.current.onCheck();
      }
    }, every);
    return () => window.clearInterval(timer);
  }, [every]);
}

export function IdentityHandoff({ state, reason, editable, error, starting, checking, onStart, onCheck }: IdentityHandoffProps) {
  const [url, setUrl] = useState<string | null>(null);
  const settled = state === "VERIFIED" || state === "IN_REVIEW";
  const showHandoff = Boolean(url) && !settled;
  usePolling(showHandoff ? POLL_WHILE_HANDING_OFF_MS : POLL_EVERY_MS[state], checking, onCheck);

  useEffect(() => {
    if (state !== "WAITING") {
      setUrl(null);
    }
  }, [state]);

  async function begin() {
    const session = await onStart();
    setUrl(session.url);
    onCheck();
  }

  return (
    <div className="flex flex-col gap-4">
      <FormAlert message={error ?? null} />
      {state === "VERIFIED" ? <Outcome title="Identity verified" body="You don't need to do this again." done /> : null}
      {state === "IN_REVIEW" ? <Outcome title="We're checking your ID" body="This usually takes a few hours. This page updates by itself." /> : null}
      {showHandoff && url ? <Handoff url={url} /> : null}
      {!settled && !showHandoff ? (
        <StartPanel state={state} reason={reason} editable={editable} starting={starting} checking={checking} onStart={() => void begin().catch(() => undefined)} onCheck={onCheck} />
      ) : null}
    </div>
  );
}

function Outcome({ title, body, done = false }: { title: string; body: string; done?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-card px-4 py-3.5", toneSurface[done ? "lime" : "sky"])} role="status">
      {done ? <CheckMark className="mt-0.5 h-5 w-5" /> : null}
      <div>
        <p className="text-small font-semibold">{title}</p>
        <p className="text-small">{body}</p>
      </div>
    </div>
  );
}

function StartPanel({
  state,
  reason,
  editable,
  starting,
  checking,
  onStart,
  onCheck,
}: {
  state: IdentityState;
  reason?: string | null;
  editable: boolean;
  starting: boolean;
  checking: boolean;
  onStart: () => void;
  onCheck: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {state === "DECLINED" ? <p className={cn("rounded-card px-4 py-3 text-small", toneSurface.pink)}>{reason ? `Your check didn't pass: ${reason}.` : "Your check didn't pass."}</p> : null}
      <p className="text-small text-ink-soft">
        {state === "WAITING"
          ? "You've started your check. Carry on where you left off."
          : "Have your passport, driving licence or ID card ready. You'll take a photo of it and a short selfie video. It takes about 2 minutes."}
      </p>
      {editable ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {state === "WAITING" ? (
            <Button variant="ghost" loading={checking} onClick={onCheck}>
              Check again
            </Button>
          ) : null}
          <Button variant="lime" loading={starting} onClick={onStart}>
            {state === "DECLINED" ? "Try again" : state === "WAITING" ? "Continue check" : "Verify your identity"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Handoff({ url }: { url: string }) {
  const desktop = useIsDesktop();
  const qr = useQrCode(desktop ? url : null);
  if (!desktop) {
    return (
      <div className="flex flex-col gap-3">
        <a href={url} className={buttonClasses("lime", "lg", "w-full")}>
          Open identity check
        </a>
        <Waiting />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-line px-5 py-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
      <div className="h-[200px] w-[200px] shrink-0 rounded-card bg-white p-2">{qr ? <img src={qr} alt="QR code that opens your identity check" className="h-full w-full" /> : null}</div>
      <div className="flex flex-col gap-2">
        <p className="text-body font-semibold">Scan with your phone&apos;s camera</p>
        <p className="text-small text-ink-soft">Your phone camera gives the clearest photos. Keep this page open.</p>
        <Waiting />
        <a href={url} className="text-meta text-ink-soft underline underline-offset-2">
          Continue on this device instead
        </a>
      </div>
    </div>
  );
}

function Waiting() {
  return (
    <p className="flex items-center gap-2 text-meta text-ink-faint" role="status">
      <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-ink-faint" />
      Waiting for your check to finish
    </p>
  );
}
