"use client";

import type { PartnerDetailView, ProfileChangeDecisionInput } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { formatDate } from "@/lib/format";

import { ProfileDetails } from "../profile-parts";
import { useAdminPartnerMutation } from "../use-partners";

const SUGGESTED_NOTES = [
  "Your new details are approved and your hub now shows your new address.",
  "Approved. Thanks for keeping your details up to date.",
  "Please upload a proof of address for your new address, then ask again.",
  "We couldn't confirm these details. Reply to this email and we'll sort it out with you.",
] as const;

export function ProfileChangeReview({ partner, canReview, locale }: { partner: PartnerDetailView; canReview: boolean; locale: string }) {
  const [note, setNote] = useState("");
  const decide = useAdminPartnerMutation(
    (input: ProfileChangeDecisionInput) => ({ path: `/v1/admin/partners/${partner.id}/profile-change`, body: input }),
    (input) => (input.approve ? "New details saved and the partner told" : "Change declined and the partner told"),
  );
  const change = partner.profileChange;
  if (!change || !partner.profile) {
    return null;
  }
  const send = (approve: boolean) => decide.mutate({ approve, note }, { onSuccess: () => setNote("") });

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Change of details asked for on {formatDate(change.requestedAt, locale)}</Stamp>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-meta text-ink-faint">Now</p>
          <ProfileDetails profile={partner.profile} />
        </div>
        <div>
          <p className="mb-2 text-meta text-ink-faint">Asked for</p>
          <ProfileDetails profile={change.profile} />
        </div>
      </div>
      {canReview ? (
        <>
          <p className="text-small text-ink-soft">
            If the address changed, get a new proof of address before approving. Approving moves the hub to the new address and renames it after the new city.
          </p>
          <FormAlert message={formError(decide.error)} />
          <Field label="Note" hint="The partner sees this word for word." error={fieldError(decide.error, "note")}>
            {({ id, describedBy, invalid }) => (
              <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[64px]" value={note} onChange={(event) => setNote(event.target.value)} />
            )}
          </Field>
          <div role="group" aria-label="Suggested notes" className="flex flex-wrap gap-2">
            {SUGGESTED_NOTES.map((suggestion) => (
              <ChoiceChip key={suggestion} tone="sky" selected={note === suggestion} onToggle={() => setNote(note === suggestion ? "" : suggestion)}>
                {suggestion}
              </ChoiceChip>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={decide.isPending} onClick={() => send(false)}>
              Decline
            </Button>
            <Button variant="lime" loading={decide.isPending} onClick={() => send(true)}>
              Approve the change
            </Button>
          </div>
        </>
      ) : null}
    </Paper>
  );
}
