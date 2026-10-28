"use client";

import type { FormDraft } from "@/lib/drafts/use-form-draft";
import { formatDateTime } from "@/lib/format";

export function DraftStatus({ draft, locale = "en-GB" }: { draft: Pick<FormDraft<unknown>, "savedAt" | "restoredAt" | "discard">; locale?: string }) {
  if (!draft.savedAt) {
    return null;
  }
  const label = draft.restoredAt === draft.savedAt ? "Picked up your draft from" : "Draft saved";
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-paper-sunk px-4 py-2.5 text-small text-ink-soft">
      <span>
        {label} {formatDateTime(draft.savedAt, locale)}
      </span>
      <button type="button" onClick={draft.discard} className="font-medium text-ink underline-offset-2 hover:underline">
        Discard draft
      </button>
    </div>
  );
}
