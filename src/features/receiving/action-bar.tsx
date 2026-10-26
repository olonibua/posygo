"use client";

import type { InboundAction } from "@/shared";

import { Button, type ButtonVariant } from "@/components/ui/button";
import { INBOUND_ACTION_LABELS } from "@/features/stock/display";

const VARIANT: Partial<Record<InboundAction, ButtonVariant>> = { CHECK_IN: "yellow", COMPLETE: "yellow", RELEASE: "lime" };

export function ActionBar({ actions, busy, onChoose }: { actions: readonly InboundAction[]; busy: boolean; onChoose: (action: InboundAction) => void }) {
  if (actions.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button key={action} variant={VARIANT[action] ?? "ghost"} disabled={busy} onClick={() => onChoose(action)}>
          {INBOUND_ACTION_LABELS[action]}
        </Button>
      ))}
    </div>
  );
}
