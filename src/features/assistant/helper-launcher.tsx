"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

import { ASSISTANT } from "./assistant-identity";
import { PosyAvatar } from "./flower-avatar";
import type { AssistantState } from "./use-assistant";

const CHIP = "rounded-chip px-3 py-1.5 text-meta font-medium transition-colors duration-150";

function NudgeBubble({ helper }: { helper: AssistantState }) {
  const { nudge } = helper;
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(Boolean(nudge)));
    return () => window.cancelAnimationFrame(frame);
  }, [nudge]);

  if (!nudge) {
    return null;
  }
  return (
    <div className={cn("grid transition-[grid-template-columns] duration-500 ease-[var(--ease-out)]", shown ? "grid-cols-[1fr]" : "grid-cols-[0fr]")}>
      <div className="min-w-0 overflow-hidden pb-1 pl-1 pt-2">
        <div
          role="status"
          className={cn(
            "pointer-events-auto mb-2 w-[min(260px,calc(100vw-120px))] rounded-[18px] rounded-bl-[6px] bg-paper px-4 py-3 text-small text-ink shadow-note ring-[1.5px] ring-line transition-opacity delay-150 duration-300",
            shown ? "opacity-100" : "opacity-0",
          )}
        >
          <p>{nudge.text}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button type="button" onClick={helper.acceptNudge} className={`${CHIP} bg-ink text-on-ink hover:bg-ink-soft`}>
              Yes, help me
            </button>
            <button type="button" onClick={helper.dismissNudge} className={`${CHIP} bg-paper-sunk text-ink hover:bg-line`}>
              I&apos;m fine
            </button>
            {nudge.kind === "stuck" && helper.page ? (
              <button type="button" onClick={helper.quietHere} className={`${CHIP} text-ink-soft underline-offset-2 hover:underline`}>
                Don&apos;t ask on this page
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelperLauncher({ helper }: { helper: AssistantState }) {
  if (helper.open) {
    return null;
  }
  return (
    <div data-assistant className="pointer-events-none fixed bottom-3 right-3 z-40 flex items-end gap-1 sm:bottom-5 sm:right-5 print:hidden">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={helper.openPanel}
          aria-label={`Open ${ASSISTANT.name}, your helper`}
          className="peer pointer-events-auto relative block rounded-[22px] drop-shadow-[0_10px_14px_rgba(17,17,17,0.38)] transition-transform duration-200 ease-[var(--ease-spring)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
        >
          <span aria-hidden className="posy-glow absolute inset-x-1 bottom-1 top-3 -z-10 rounded-full bg-yellow/70 blur-md" />
          <PosyAvatar mood={helper.mood} size={72} />
          {helper.nudge ? <span aria-hidden className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-magenta ring-2 ring-paper" /> : null}
        </button>
        {helper.nudge ? null : (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-4 right-full mr-2 translate-y-1 whitespace-nowrap rounded-chip bg-ink px-3 py-1.5 text-meta font-medium text-on-ink opacity-0 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100"
          >
            Need a hand?
          </span>
        )}
      </div>
      <NudgeBubble helper={helper} />
    </div>
  );
}
