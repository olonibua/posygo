"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";

const WAIT_SECONDS = 60;

export function ResendCode({ send }: { send: () => Promise<unknown> }) {
  const [waitLeft, setWaitLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (waitLeft <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setWaitLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [waitLeft]);

  async function resend() {
    setSending(true);
    setProblem(null);
    try {
      await send();
      setWaitLeft(WAIT_SECONDS);
    } catch (caught) {
      setProblem(caught instanceof ApiError ? caught.message : "Couldn't send. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (waitLeft > 0) {
    return <span aria-live="polite">New code sent.</span>;
  }
  return (
    <span aria-live="polite">
      <button type="button" onClick={() => void resend()} disabled={sending} className="underline disabled:opacity-60">
        Send a new code
      </button>
      {problem ? <span className="text-danger"> {problem}</span> : null}
    </span>
  );
}
