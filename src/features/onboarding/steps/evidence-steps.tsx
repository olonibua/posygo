"use client";

import { type IdentityCheckView, MONTHLY_ORDER_BANDS, MONTHLY_UNIT_BANDS, PRODUCT_HAZARDS, type VerificationView } from "@/shared";

import { ChoiceChip } from "@/components/ui/choice-chip";
import { FileDrop } from "@/components/ui/file-drop";
import { Field, Select, Textarea } from "@/components/ui/form-controls";
import type { Tone } from "@/components/ui/tone";
import { IdentityHandoff } from "@/features/identity/identity-handoff";
import { identityStateOf } from "@/features/identity/identity-state";
import { uploadPrivateFile } from "@/lib/api/uploads";

import { DOCUMENT_LABELS, HAZARD_LABELS, ORDER_BAND_LABELS, UNIT_BAND_LABELS } from "../display";
import { useVendorIdentity } from "../use-vendor-identity";
import { errorFor } from "../use-verification";
import type { StepProps } from "./business-steps";

const CHOICE_TONES: readonly Tone[] = ["yellow", "lime", "sky", "pink", "orange"];

export function IdentityStep({ check }: { check: IdentityCheckView | null }) {
  const identity = useVendorIdentity();
  return (
    <IdentityHandoff
      state={identityStateOf(check)}
      reason={check?.reason}
      editable
      error={identity.error}
      starting={identity.start.isPending}
      checking={identity.refresh.isPending}
      onStart={() => identity.start.mutateAsync()}
      onCheck={() => identity.refresh.mutate()}
    />
  );
}

export function DocumentsStep({ values, set, errors, view }: StepProps & { view: VerificationView }) {
  const statusOf = (fileId: string | undefined) => view.documents.find((document) => document.fileId === fileId)?.status;
  const slots = ["businessDocument"] as const;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-small text-ink-soft">Files go straight to private storage. Only verification staff can open them.</p>
      {slots.map((slot) => {
        const status = statusOf(values.documents[slot]);
        return (
          <FileDrop
            key={slot}
            label={DOCUMENT_LABELS[slot].label}
            hint={DOCUMENT_LABELS[slot].hint}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            initialState={status === "VERIFIED" ? "VERIFIED" : status === "REJECTED" ? "REJECTED" : "EMPTY"}
            error={errorFor(errors, `documents.${slot}`) ?? errorFor(errors, "documents")}
            onFile={async (file) => {
              const fileId = await uploadPrivateFile(file, "KYC_DOCUMENT");
              set({ documents: { ...values.documents, [slot]: fileId } });
            }}
          />
        );
      })}
    </div>
  );
}

export function OperationsStep({ values, set, errors }: StepProps) {
  function toggleHazard(hazard: string) {
    if (hazard === "NONE") {
      set({ hazards: values.hazards.includes("NONE") ? [] : ["NONE"] });
      return;
    }
    const others = values.hazards.filter((item) => item !== "NONE");
    set({ hazards: others.includes(hazard) ? others.filter((item) => item !== hazard) : [...others, hazard] });
  }
  return (
    <div className="flex flex-col gap-5">
      <Field label="What will you store with us?" hint="A sentence or two is plenty." error={errorFor(errors, "productsDescription")}>
        {({ id }) => <Textarea id={id} value={values.productsDescription} onChange={(event) => set({ productsDescription: event.target.value })} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Units arriving per month" error={errorFor(errors, "monthlyUnits")}>
          {({ id }) => (
            <Select id={id} value={values.monthlyUnits} onChange={(event) => set({ monthlyUnits: event.target.value })}>
              <option value="">Choose one</option>
              {MONTHLY_UNIT_BANDS.map((band) => (
                <option key={band} value={band}>
                  {UNIT_BAND_LABELS[band]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Orders per month" error={errorFor(errors, "monthlyOrders")}>
          {({ id }) => (
            <Select id={id} value={values.monthlyOrders} onChange={(event) => set({ monthlyOrders: event.target.value })}>
              <option value="">Choose one</option>
              {MONTHLY_ORDER_BANDS.map((band) => (
                <option key={band} value={band}>
                  {ORDER_BAND_LABELS[band]}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <fieldset>
        <legend className="mb-3 text-small font-medium">Do any products need special handling?</legend>
        <div className="flex flex-wrap gap-2.5">
          {PRODUCT_HAZARDS.map((hazard, index) => (
            <ChoiceChip key={hazard} selected={values.hazards.includes(hazard)} tone={CHOICE_TONES[index % CHOICE_TONES.length]!} onToggle={() => toggleHazard(hazard)}>
              {HAZARD_LABELS[hazard]}
            </ChoiceChip>
          ))}
        </div>
        {errorFor(errors, "hazards") ? (
          <p role="alert" className="mt-1.5 text-meta text-danger">
            {errorFor(errors, "hazards")}
          </p>
        ) : null}
      </fieldset>
    </div>
  );
}
