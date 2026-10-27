"use client";

import { hasPermission, type SupportCaseStatus } from "@/shared";
import { useState } from "react";

import { EmptyState, FilterTabs } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingRows } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { AssistantGaps } from "./assistant-gaps";
import { EmailLog } from "./email-log";
import { SupportCaseCard } from "./support-case-card";
import { useSupportCases } from "./use-support-cases";

type View = SupportCaseStatus | "GAPS" | "EMAILS";

const FILTERS: ReadonlyArray<{ value: View; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "GAPS", label: "Unanswered questions" },
  { value: "EMAILS", label: "Emails sent" },
];

export function AdminSupportPage() {
  const user = useCurrentUser();
  const [filter, setFilter] = useState<View>("OPEN");
  const cases = useSupportCases(filter === "RESOLVED" ? "RESOLVED" : "OPEN");
  const canManage = hasPermission(user.role, "support.manage");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Trust"
        title="Support cases"
        lead="Problems people hit and questions they asked the helper. The same failure from several people is grouped into one case, with the steps each person took."
      />
      <FilterTabs label="Filter cases" options={FILTERS} value={filter} onChange={setFilter} />
      {filter === "GAPS" ? (
        <AssistantGaps />
      ) : filter === "EMAILS" ? (
        <EmailLog />
      ) : cases.isLoading ? (
        <LoadingRows columns={2} />
      ) : (cases.data ?? []).length === 0 ? (
        <EmptyState title={filter === "OPEN" ? "Nothing open" : "Nothing resolved yet"} body="Cases appear here when the helper reports an error or passes on a question." />
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
