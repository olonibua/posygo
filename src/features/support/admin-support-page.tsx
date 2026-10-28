"use client";

import { hasPermission, type SupportCaseKind, type SupportCaseStatus } from "@/shared";
import { useState } from "react";

import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { AssistantGaps } from "./assistant-gaps";
import { EmailLog } from "./email-log";
import { SupportCaseCard } from "./support-case-card";
import { useSupportCases } from "./use-support-cases";

type View = "PROBLEMS" | "QUESTIONS" | "RESOLVED" | "GAPS" | "EMAILS";

const FILTERS: ReadonlyArray<{ value: View; label: string }> = [
  { value: "PROBLEMS", label: "System problems" },
  { value: "QUESTIONS", label: "Questions" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "GAPS", label: "Unanswered questions" },
  { value: "EMAILS", label: "Emails sent" },
];

export function AdminSupportPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<View>("PROBLEMS");
  const status: SupportCaseStatus = filter === "RESOLVED" ? "RESOLVED" : "OPEN";
  const kind: SupportCaseKind | undefined = filter === "PROBLEMS" ? "ERROR" : filter === "QUESTIONS" ? "QUESTION" : undefined;
  const cases = useSupportCases(status, kind);
  const canManage = hasPermission(user.role, "support.manage");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Trust"
        title="Support cases"
        lead="Failures on our side, caught by the system or reported through Posy, and questions people asked. Typing mistakes are left out. The same failure is grouped into one case, and the team is emailed when a new one opens."
      />
      <FilterTabs label="Filter cases" options={FILTERS} value={filter} onChange={setFilter} />
      {filter === "GAPS" ? (
        <AssistantGaps />
      ) : filter === "EMAILS" ? (
        <EmailLog />
      ) : cases.isLoading ? (
        <LoadingRows columns={2} />
      ) : (cases.data ?? []).length === 0 ? (
        <EmptyState
          title={filter === "PROBLEMS" ? "No system problems" : filter === "QUESTIONS" ? "No open questions" : "Nothing resolved yet"}
          body="Cases appear here when the system fails, when Posy reports an error, or when someone asks the team a question."
        />
      ) : (
        <ul className="stagger flex flex-col gap-4">
          {cases.data!.map((supportCase) => (
            <li key={supportCase.id}>
              <SupportCaseCard supportCase={supportCase} canManage={canManage} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
