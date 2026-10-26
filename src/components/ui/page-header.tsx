import type { ReactNode } from "react";

import { Stamp } from "./surfaces";

export function PageHeader({ stamp, title, lead, action }: { stamp: string; title: string; lead?: string; action?: ReactNode }) {
  return (
    <header className="motion-rise flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
      <div>
        <Stamp>{stamp}</Stamp>
        <h1 className="mb-2.5 mt-2 text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-h1">{title}</h1>
        {lead ? <p className="max-w-[660px] text-body leading-[25px] text-ink-soft">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
