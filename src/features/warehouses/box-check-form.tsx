"use client";

import type { BoxCheckInput, BoxFullness, HubRepackListView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { Field, FormAlert, Textarea } from "@/components/ui/form-controls";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { PhotoCollector } from "@/features/receiving/photo-collector";
import { FULLNESS_OPTIONS } from "@/features/stock/box-check-summary";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

export function hubBoxesKey(warehouseId: string): string[] {
  return ["warehouse", warehouseId, "boxes"];
}

interface BoxCheckFormProps {
  warehouseId: string;
  vendorId: string;
  businessName: string;
  orderId?: string;
  onDone?: () => void;
}

export function BoxCheckForm({ warehouseId, vendorId, businessName, orderId, onDone }: BoxCheckFormProps) {
  const queryClient = useQueryClient();
  const [fullness, setFullness] = useState<BoxFullness | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const check = useMutation({
    mutationFn: (input: BoxCheckInput) => apiRequest<HubRepackListView>(`/v1/warehouse/warehouses/${warehouseId}/boxes/checks`, { method: "POST", body: input }),
    onSuccess: (next) => {
      queryClient.setQueryData(hubBoxesKey(warehouseId), next);
      toast.success("Box photo saved", `${businessName} can see it now.`);
      onDone?.();
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (fullness === null) {
      setProblem("Choose how full the boxes are.");
      return;
    }
    setProblem(null);
    check.mutate({ vendorId, fullnessPct: fullness, photoFileIds: photos, note: note.trim() || undefined, orderId });
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <FormAlert message={problem ?? formError(check.error)} />
      <fieldset>
        <legend className="mb-2 text-small">How full are {businessName}&apos;s boxes now?</legend>
        <div className="flex flex-wrap gap-2">
          {FULLNESS_OPTIONS.map((option) => (
            <ChoiceChip key={option.value} tone="sky" selected={fullness === option.value} onToggle={() => setFullness(option.value)}>
              {option.label}
            </ChoiceChip>
          ))}
        </div>
      </fieldset>
      <PhotoCollector label="Photo of what's left" hint="Open the boxes so the seller can see what's inside." max={6} error={fieldError(check.error, "photoFileIds")} onChange={setPhotos} />
      <Field label="Note (optional)">
        {({ id }) => <Textarea id={id} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} className="min-h-[60px]" />}
      </Field>
      <Button type="submit" variant="yellow" loading={check.isPending} disabled={photos.length === 0}>
        Save box photo
      </Button>
    </form>
  );
}
