import type { ReactNode } from "react";

import { Stamp } from "@/components/ui/surfaces";

export function PageIntro({ stamp, title, children }: { stamp: string; title: string; children?: ReactNode }) {
  return (
    <header className="pb-4 pt-12 sm:pt-20">
      <Stamp>{stamp}</Stamp>
      <h1 className="mt-3.5 max-w-[900px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">{title}</h1>
      {children ? <div className="mt-6 max-w-[720px] text-lead text-ink-soft">{children}</div> : null}
    </header>
  );
}

export function PageSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pt-16 sm:pt-20">
      <h2 className="text-[32px] font-medium leading-[36px] tracking-[-1.2px] md:text-[40px] md:leading-[44px]">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
