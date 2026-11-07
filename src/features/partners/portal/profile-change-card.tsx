"use client";

import type { PartnerDetailView, PartnerProfileInput } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { formError } from "@/features/receiving/api-errors";
import { formatDate } from "@/lib/format";

import { ProfileDetails, ProfileForm } from "../profile-parts";
import { usePortalMutation } from "../use-partners";

export function ProfileChangeCard({ partner, locale, disabled }: { partner: PartnerDetailView; locale: string; disabled: boolean }) {
  const [editing, setEditing] = useState(false);
  const request = usePortalMutation((input: PartnerProfileInput) => ({ path: "/v1/partner/profile/change", body: input }), "Sent for review. We'll email you when it's done");
  const withdraw = usePortalMutation(() => ({ path: "/v1/partner/profile/change", method: "DELETE" }));
  const profile = partner.profile;
  const change = partner.profileChange;
  if (!profile) {
    return null;
  }

  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Stamp>Your details</Stamp>
        {change ? <StatusPill tone="yellow">Change waiting for review</StatusPill> : null}
      </div>
      {editing ? (
        <ProfileForm
          initial={profile}
          submitLabel="Send for review"
          pending={request.isPending}
          error={request.error}
          onCancel={() => setEditing(false)}
          onSubmit={(input) => request.mutate(input, { onSuccess: () => setEditing(false) })}
        />
      ) : (
        <ProfileDetails profile={profile} />
      )}
      {change ? (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          <p className="text-small text-ink-soft">You asked on {formatDate(change.requestedAt, locale)} to change your details to:</p>
          <ProfileDetails profile={change.profile} />
          <FormAlert message={formError(withdraw.error)} />
          <div className="flex justify-end">
            <Button variant="ghost" loading={withdraw.isPending} onClick={() => withdraw.mutate(undefined)}>
              Withdraw the change
            </Button>
          </div>
        </div>
      ) : editing || disabled ? null : (
        <>
          <p className="text-small text-ink-soft">Moved or got a new phone? Ask us to change your details. We check them first, and may ask for a new proof of address.</p>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setEditing(true)}>
              Ask to change my details
            </Button>
          </div>
        </>
      )}
    </Paper>
  );
}
