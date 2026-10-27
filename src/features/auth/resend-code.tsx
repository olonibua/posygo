"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api/client";

const WAIT_SECONDS = 60;

export function ResendCode({ send }: { send: () => Promise<unknown> }) {
  const [waitLeft, setWaitLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (waitLeft <= 0) {
      return;
    }
    const timer = window.setTimeout(() => setWaitLeft((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [waitLeft]);

  async function resend() {
    setSending(true);
    setNotice(null);
    try {
      await send();
      setNotice("A new code is on its way. Use the newest one; earlier codes stop working.");
      setWaitLeft(WAIT_SECONDS);
    } catch (caught) {
      setNotice(caught instanceof ApiError ? caught.message : "We couldn't reach the server. Try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="-mt-3 flex flex-col gap-1 text-[13px] text-ink-soft" aria-live="polite">
      <p>
        Didn&apos;t get it?{" "}
        {waitLeft > 0 ? (
          <span>You can ask for another in {waitLeft}s.</span>
        ) : (
          <button type="button" onClick={() => void resend()} disabled={sending} className="underline disabled:opacity-60">
            {sending ? "Sending…" : "Send a new code"}
          </button>
        )}
      </p>
      {notice ? <p className="text-ink">{notice}</p> : null}
    </div>
  );
}
