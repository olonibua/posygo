"use client";

import { ASSISTANT } from "./assistant-identity";
import { FlowerAvatar } from "./flower-avatar";
import type { AssistantState } from "./use-assistant";

const CHIP = "rounded-chip px-3 py-1.5 text-meta font-medium transition-colors duration-150";

function NudgeBubble({ helper }: { helper: AssistantState }) {
  const { nudge } = helper;
  if (!nudge) {
    return null;
  }
  return (
    <div role="status" className="helper-bubble-enter mb-2 max-w-[260px] rounded-[18px] rounded-bl-[6px] bg-paper px-4 py-3 text-small text-ink shadow-note ring-[1.5px] ring-line">
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
  );
}

export function HelperLauncher({ helper }: { helper: AssistantState }) {
  if (helper.open) {
    return null;
  }
  return (
    <div data-assistant className="fixed bottom-4 left-4 z-40 flex items-end gap-2 print:hidden">
      <button
        type="button"
        onClick={helper.openPanel}
        aria-label={`Open ${ASSISTANT.name}, your helper`}
        className="peer relative grid h-16 w-16 place-items-center rounded-full bg-paper shadow-note ring-[1.5px] ring-line transition-transform duration-200 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ink"
      >
        <FlowerAvatar mood={helper.mood} size={52} />
        {helper.nudge ? <span aria-hidden className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-magenta ring-2 ring-paper" /> : null}
      </button>
      {helper.nudge ? (
        <NudgeBubble helper={helper} />
      ) : (
        <span
          aria-hidden
          className="pointer-events-none mb-3 translate-y-1 rounded-chip bg-ink px-3 py-1.5 text-meta font-medium text-on-ink opacity-0 transition-all duration-200 peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100"
        >
          Need a hand?
        </span>
      )}
    </div>
  );
}
