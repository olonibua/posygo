"use client";

import { type AccountRequestKind, hasPermission, type MySupportRequestView, type SupportReportResult } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip, StatusPill } from "@/components/ui/chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";
import { errorMessage } from "@/features/receiving/api-errors";

import { SUPPORT_KIND_DISPLAY } from "./support-display";
import { useAccountRequest, useMyRequests } from "./use-my-requests";

export function MyRequestsPage() {
  const user = useCurrentUser();
  const requests = useMyRequests();
  const ownsAccount = user.vendorId ? user.role === "VENDOR_OWNER" : user.partnerId ? hasPermission(user.role, "partner.profile.manage") : false;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Help" title="Help & requests" lead="Questions you asked, problems you reported and requests about your account, with our replies." />
      <section aria-labelledby="sent-heading" className="flex flex-col gap-3">
        <h2 id="sent-heading" className="text-h3">
          What you&apos;ve sent us
        </h2>
        {requests.isLoading ? (
          <SkeletonLines />
        ) : (requests.data ?? []).length === 0 ? (
          <EmptyState title="Nothing sent yet" body="Ask Posy, the helper in the corner, whenever you're stuck. What you send appears here with our reply." />
        ) : (
          <ul className="flex flex-col gap-3">
            {requests.data!.map((request) => (
              <li key={`${request.reference}-${request.sentAt}`}>
                <RequestCard request={request} locale={localeFor(user.countryCode)} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="data-heading" className="flex flex-col gap-3">
        <h2 id="data-heading" className="text-h3">
          Your data and account
        </h2>
        <div className="grid gap-4 xl:grid-cols-2">
          <AccountRequestCard kind="DATA_COPY" title="Get a copy of your data" body="We'll email you a copy of the personal details we hold about you within one month." action="Ask for a copy" />
          {ownsAccount ? (
            <AccountRequestCard
              kind="ACCOUNT_CLOSURE"
              title="Close your account"
              body="We'll help you settle any balance and collect any stock first, then close the account. Some records are kept for as long as the law requires."
              action="Ask to close"
              asksWhy
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}

function RequestCard({ request, locale }: { request: MySupportRequestView; locale: string }) {
  const kind = SUPPORT_KIND_DISPLAY[request.kind];
  return (
    <Paper className="flex flex-col gap-2 px-6 py-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-small font-semibold">{request.reference}</span>
        <Chip size="sm" tone={kind.tone}>
          {kind.label}
        </Chip>
        {request.status === "RESOLVED" ? <StatusPill tone="lime">Answered</StatusPill> : <StatusPill tone="yellow">Open</StatusPill>}
        <span className="ml-auto text-meta text-ink-soft">Sent {formatDate(request.sentAt, locale)}</span>
      </div>
      {request.message ? <p className="text-small">{request.message}</p> : null}
      {request.resolutionNote ? (
        <p className="rounded-card bg-lime/40 px-4 py-3 text-small">
          <span className="font-medium">Our reply: </span>
          {request.resolutionNote}
        </p>
      ) : null}
    </Paper>
  );
}

function AccountRequestCard({ kind, title, body, action, asksWhy = false }: { kind: AccountRequestKind; title: string; body: string; action: string; asksWhy?: boolean }) {
  const request = useAccountRequest();
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<SupportReportResult | null>(null);

  const send = () => request.mutate({ kind, message }, { onSuccess: (result) => setSent(result) });

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>{title}</Stamp>
      <p className="text-small text-ink-soft">{body}</p>
      {sent ? (
        <p className="rounded-card bg-lime/40 px-4 py-3 text-small">
          {sent.alreadyKnown ? `You've already asked. We're working on ${sent.reference}.` : `Sent as ${sent.reference}. We'll reply by email and here.`}
        </p>
      ) : (
        <>
          {asking ? (
            <Field label="Anything we should know? (optional)">
              {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} rows={3} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} />}
            </Field>
          ) : null}
          <FormAlert message={errorMessage(request.error)} />
          <div className="flex justify-end gap-2">
            {asking ? (
              <Button variant="ghost" onClick={() => setAsking(false)}>
                Cancel
              </Button>
            ) : null}
            <Button variant="ghost" loading={request.isPending} onClick={asksWhy && !asking ? () => setAsking(true) : send}>
              {asking ? "Send request" : action}
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
}
