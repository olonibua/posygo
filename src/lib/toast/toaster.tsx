"use client";

import { useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

import { dismissToast, serverToastSnapshot, subscribeToasts, type Toast, type ToastTone, toastSnapshot } from "./toast-store";

const LIFETIME_MS = 4500;

const TONES: Record<ToastTone, { surface: string; mark: string; bar: string }> = {
  success: { surface: "bg-lime", mark: "✓", bar: "bg-cocoa/40" },
  error: { surface: "bg-pink", mark: "!", bar: "bg-cocoa/40" },
  info: { surface: "bg-sky", mark: "i", bar: "bg-cocoa/40" },
};

export function useToasts() {
  return useSyncExternalStore(subscribeToasts, toastSnapshot, serverToastSnapshot);
}

export function Toaster() {
  const { visible } = useToasts();
  return (
    <div aria-live="polite" aria-relevant="additions" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:right-6 sm:w-[380px]">
      {visible.map((item) => (
        <ToastCard key={item.id} toast={item} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const [leaving, setLeaving] = useState(false);
  const tone = TONES[toast.tone];
  const close = () => setLeaving(true);
  return (
    <div
      role={toast.tone === "error" ? "alert" : "status"}
      onAnimationEnd={(event) => {
        if (event.animationName === "toast-out") {
          dismissToast(toast.id);
        }
      }}
      className={cn(
        "group pointer-events-auto relative overflow-hidden rounded-card text-cocoa shadow-note",
        tone.surface,
        leaving ? "[animation:toast-out_var(--dur)_var(--ease-in)_forwards]" : "[animation:toast-in_var(--dur-slow)_var(--ease-spring)_both]",
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span aria-hidden className="motion-pop mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cocoa text-[13px] font-bold text-on-ink [animation-delay:120ms]">
          {tone.mark}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-5">{toast.title}</p>
          {toast.body ? <p className="mt-0.5 text-small text-cocoa/80">{toast.body}</p> : null}
        </div>
        <button type="button" onClick={close} aria-label="Dismiss" className="motion-press -mr-1 grid h-7 w-7 place-items-center rounded-full text-cocoa/70 hover:bg-cocoa/10 hover:text-cocoa">
          ×
        </button>
      </div>
      <span
        aria-hidden
        onAnimationEnd={close}
        className={cn("absolute inset-x-0 bottom-0 h-1 origin-left group-hover:[animation-play-state:paused]", tone.bar)}
        style={{ animation: `countdown ${LIFETIME_MS}ms linear forwards` }}
      />
    </div>
  );
}
