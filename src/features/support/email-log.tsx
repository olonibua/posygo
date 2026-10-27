"use client";

import type { EmailLogView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Chip } from "@/components/ui/chip";
import { Field, Input } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { LoadingRows } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { apiRequest } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export function EmailLog() {
  const [search, setSearch] = useState("");
  const recipient = search.trim().toLowerCase();
  const emails = useQuery({ queryKey: ["admin", "emails", recipient], queryFn: () => apiRequest<EmailLogView[]>(`/v1/admin/emails${recipient ? `?to=${encodeURIComponent(recipient)}` : ""}`) });
  return (
    <div className="flex flex-col gap-5">
      <Field label="Find emails sent to" hint="Part of an email address is enough.">
        {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} type="search" value={search} onChange={(event) => setSearch(event.target.value)} />}
      </Field>
      {emails.isLoading ? (
        <LoadingRows columns={1} />
      ) : (emails.data ?? []).length === 0 ? (
        <EmptyState title="No emails found" body="Every email the platform sends is listed here, with whether it was delivered to the email service." />
      ) : (
        <Paper className="px-6 py-2">
          <ul className="flex flex-col divide-y divide-line">
            {emails.data!.map((email) => (
              <li key={email.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3 text-small">
                <span className="min-w-[200px] flex-1">{email.subject}</span>
                <span className="text-ink-soft">{email.to}</span>
                <span className="font-mono text-meta text-ink-soft">{email.kind}</span>
                <Chip size="sm" tone={email.status === "SENT" ? "lime" : "pink"}>
                  {email.status === "SENT" ? "Sent" : "Failed"}
                </Chip>
                <span className="text-meta text-ink-soft">{formatDateTime(email.sentAt, "en-GB")}</span>
                {email.error ? <span className="w-full text-meta text-danger">{email.error}</span> : null}
              </li>
            ))}
          </ul>
        </Paper>
      )}
    </div>
  );
}
