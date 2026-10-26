"use client";

import type { VerificationDecisionInput } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";

export function DecisionPanel({ vendorId, onDecided }: { vendorId: string; onDecided: () => void }) {
  const [reason, setReason] = useState("");
  const decide = useMutation({ mutationFn: (input: VerificationDecisionInput) => apiRequest(`/v1/admin/verifications/${vendorId}/decision`, { method: "POST", body: input }), onSuccess: onDecided });
  const error = decide.error instanceof ApiError ? (decide.error.fieldErrors.reason?.[0] ?? decide.error.message) : null;

  return (
    <Paper className="flex flex-col gap-4 px-6 py-5">
      <Stamp>Decision</Stamp>
      <FormAlert message={error} />
      <Field label="Note to the vendor" hint="Required when asking for changes or rejecting. They'll see it word for word.">
        {({ id, describedBy }) => <Textarea id={id} aria-describedby={describedBy} value={reason} onChange={(event) => setReason(event.target.value)} />}
      </Field>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="lime" loading={decide.isPending} onClick={() => decide.mutate({ decision: "APPROVE" })}>
          Approve
        </Button>
        <Button variant="yellow" disabled={decide.isPending} onClick={() => decide.mutate({ decision: "REQUEST_RESUBMISSION", reason })}>
          Ask for changes
        </Button>
        <Button variant="ghost" disabled={decide.isPending} onClick={() => decide.mutate({ decision: "REJECT", reason })}>
          Reject
        </Button>
      </div>
    </Paper>
  );
}
