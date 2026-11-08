"use client";

import type { AccountControlView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

type AccountAction = "deactivate" | "reactivate" | "delete";

const DONE: Record<AccountAction, string> = { deactivate: "Account deactivated", reactivate: "Account reactivated", delete: "Account deleted" };

interface AccountControlPanelProps {
  accountPath: string;
  accountName: string;
  control: AccountControlView;
  listHref: string;
  locale: string;
}

export function AccountControlPanel({ accountPath, accountName, control, listHref, locale }: AccountControlPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState("");
  const act = useMutation({
    mutationFn: (action: AccountAction) => apiRequest<void>(`${accountPath}/${action}`, { method: "POST", body: { reason } }),
    onSuccess: (_output, action) => {
      toast.success(DONE[action]);
      setReason("");
      setConfirming(false);
      if (action === "delete") {
        router.replace(listHref);
      }
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
  });
  const deactivated = control.deactivatedAt !== null;
  const nameMatches = typedName.trim().toLowerCase() === accountName.trim().toLowerCase();

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Account</Stamp>
      <p className="text-small text-ink-soft">{deactivated ? `Deactivated on ${formatDate(control.deactivatedAt!, locale)}. Nobody on the team can sign in.` : "Active. The team can sign in."}</p>
      <FormAlert message={formError(act.error)} />
      <Field label="Reason" hint="At least 10 characters. Kept in the audit log." error={fieldError(act.error, "reason")}>
        {({ id, describedBy, invalid }) => (
          <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} className="min-h-[72px]" value={reason} onChange={(event) => setReason(event.target.value)} />
        )}
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-small text-ink-soft">{deactivated ? "Let the team sign in again." : "Sign everyone out and stop all activity."}</span>
        <Button
          variant={deactivated ? "lime" : "yellow"}
          loading={act.isPending && act.variables !== "delete"}
          disabled={act.isPending}
          onClick={() => act.mutate(deactivated ? "reactivate" : "deactivate")}
        >
          {deactivated ? "Reactivate" : "Deactivate"}
        </Button>
      </div>
      {control.deletable ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-small text-ink-soft">Remove the account, its team and files for good.</span>
            {confirming ? null : (
              <Button variant="ghost" disabled={act.isPending} onClick={() => setConfirming(true)}>
                Delete
              </Button>
            )}
          </div>
          {confirming ? (
            <>
              <Field label={`Type ${accountName} to confirm`}>{({ id }) => <Input id={id} autoComplete="off" value={typedName} onChange={(event) => setTypedName(event.target.value)} />}</Field>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" disabled={act.isPending} onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
                <Button variant="primary" loading={act.isPending && act.variables === "delete"} disabled={!nameMatches || act.isPending} onClick={() => act.mutate("delete")}>
                  Delete for good
                </Button>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-line pt-4 text-small text-ink-faint">Has activity on record, so it can only be deactivated.</p>
      )}
    </Paper>
  );
}
