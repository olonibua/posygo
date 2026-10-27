"use client";

import type { AssistantQuestionView, AssistantUsageView } from "@/shared";
import { useQuery } from "@tanstack/react-query";

import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/navigation-controls";
import { LoadingRows } from "@/components/ui/skeleton";
import { StatTile } from "@/components/ui/stat-tile";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

const OUTCOME_LABELS: Record<AssistantQuestionView["outcome"], string> = { ANSWERED: "Answered", UNSURE: "Didn't know", LIMITED: "Daily limit reached", FAILED: "Service failed" };

function Usage({ usage }: { usage: AssistantUsageView }) {
  const share = usage.questions > 0 ? Math.round((usage.answered / usage.questions) * 100) : 0;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile tone="yellow" label="Questions" value={usage.questions.toLocaleString("en-GB")} note="Last 7 days" />
      <StatTile tone="lime" label="Answered" value={`${share}%`} note={`${usage.unsure} handed to the team`} />
      <StatTile tone="sky" label="Tokens used" value={`${Math.round((usage.inputTokens + usage.outputTokens) / 1000).toLocaleString("en-GB")}k`} note="Read and written, last 7 days" />
    </div>
  );
}

export function AssistantGaps() {
  const usage = useQuery({ queryKey: ["assistant", "usage", 7], queryFn: () => apiRequest<AssistantUsageView>("/v1/admin/assistant/usage?days=7") });
  const gaps = useQuery({ queryKey: ["assistant", "gaps"], queryFn: () => apiRequest<AssistantQuestionView[]>("/v1/admin/assistant/gaps") });
  return (
    <div className="flex flex-col gap-5">
      {usage.data ? <Usage usage={usage.data} /> : null}
      <Paper className="px-6 py-5">
        <Stamp>Questions it couldn&apos;t answer</Stamp>
        <p className="mt-1.5 text-small text-ink-soft">Each one points at something the page notes or guides don&apos;t cover yet.</p>
        {gaps.isLoading ? (
          <LoadingRows columns={1} />
        ) : (gaps.data ?? []).length === 0 ? (
          <EmptyState title="No gaps yet" body="Questions the helper couldn't answer will show here." />
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-line">
            {gaps.data!.map((gap) => (
              <li key={gap.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-small">
                <span className="flex-1">{gap.question}</span>
                <span className="font-mono text-meta text-ink-soft">{gap.page}</span>
                <Chip size="sm" tone={gap.outcome === "UNSURE" ? "yellow" : "pink"}>
                  {OUTCOME_LABELS[gap.outcome]}
                </Chip>
                <span className="text-meta text-ink-soft">{formatDateTime(gap.createdAt, "en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </Paper>
    </div>
  );
}
