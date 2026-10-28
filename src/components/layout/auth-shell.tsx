import type { ReactNode } from "react";

import { BackLink } from "@/components/ui/back-link";
import { Logo } from "@/components/brand/logo";
import { type Step, Stepper } from "@/components/ui/stepper";
import { NotebookNote, Stamp, Sticker } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";

interface AuthShellProps {
  railStamp: string;
  railTitle: ReactNode;
  railNote: ReactNode;
  steps?: readonly Step[];
  currentStep?: number;
  children: ReactNode;
}

export function AuthShell({ railStamp, railTitle, railNote, steps, currentStep = 0, children }: AuthShellProps) {
  const rail = steps ? "bg-sky" : "bg-lime";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-[76px] items-center justify-between border-b border-line px-4 sm:px-9">
        <Logo />
        <BackLink href="/" className="text-small">
          Back to home
        </BackLink>
      </header>
      <div className="grid flex-1 lg:grid-cols-[400px_1fr]">
        <aside className={cn("grain relative hidden overflow-hidden px-10 py-[46px] lg:block", rail)}>
          <Stamp className="motion-rise text-cocoa">{railStamp}</Stamp>
          <h2 className="motion-rise mb-[38px] mt-3 text-[38px] font-medium leading-10 tracking-[-1.3px] [--i:1]">{railTitle}</h2>
          {steps ? <Stepper steps={steps} current={currentStep} /> : null}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[230px] bg-[url(/brand/confetti-dense.svg)] bg-[length:520px] bg-center" />
          <Sticker src="/brand/sticker-flower-pink.svg" className="bottom-[150px] right-[26px] w-[92px] rotate-[10deg]" />
          <NotebookNote tone={steps ? "yellow" : "sky"} className="absolute bottom-[60px] left-10 right-14 text-[19px] font-medium leading-[25px] tracking-[-0.4px]">
            {railNote}
          </NotebookNote>
        </aside>
        <main id="main" className="flex justify-center px-4 py-10 sm:px-10 sm:py-[54px]">
          <div className="motion-rise w-full max-w-[560px] [--i:2]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function AuthHeading({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[40px] font-medium leading-[42px] tracking-[-1.6px] sm:text-[48px] sm:leading-[48px] sm:tracking-[-1.8px]">{title}</h1>
      {lead ? <p className="mt-3.5 text-[17px] leading-[26px] text-ink-soft">{lead}</p> : null}
    </div>
  );
}

export const SIGNUP_STEPS: readonly Step[] = [
  { title: "Your account", detail: "Business name, market and login" },
  { title: "Confirm your email", detail: "An 8-digit code from us" },
  { title: "Verify your business", detail: "Identity and company checks" },
];
