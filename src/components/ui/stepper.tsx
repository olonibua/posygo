import { cn } from "@/lib/cn";

import { CheckMark } from "./check-mark";

export interface Step {
  title: string;
  detail: string;
}

export function Stepper({ steps, current }: { steps: readonly Step[]; current: number }) {
  return (
    <ol className="stagger flex flex-col">
      {steps.map((step, index) => {
        const state = index < current ? "done" : index === current ? "current" : "todo";
        const last = index === steps.length - 1;
        return (
          <li
            key={step.title}
            aria-current={state === "current" ? "step" : undefined}
            className={cn(
              "motion-rise relative flex gap-3.5 pb-7",
              !last && "after:absolute after:bottom-0.5 after:left-[17px] after:top-10 after:border-l-2 after:border-dotted after:border-line-strong",
            )}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full border-[1.5px] text-meta font-semibold transition-colors duration-300",
                state === "done" && "border-lime bg-lime text-cocoa",
                state === "current" && "border-cocoa bg-cocoa",
                state === "todo" && "border-line-strong bg-paper text-ink-faint",
              )}
            >
              {state === "done" ? (
                <CheckMark className="h-4 w-4" />
              ) : state === "current" ? (
                <img src="/brand/flower-mark-cream.svg" alt="" className="w-5 animate-[spin_6s_linear_infinite]" />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <div>
              <p className="pt-0.5 text-[15px] font-medium">{step.title}</p>
              <p className="mt-0.5 text-[13px] text-ink-soft">{step.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
