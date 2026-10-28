"use client";

import type { VerificationView } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DraftStatus } from "@/components/ui/draft-status";
import { FormAlert } from "@/components/ui/form-controls";
import { SegmentedProgress } from "@/components/ui/progress-bar";
import { Stepper } from "@/components/ui/stepper";
import { NotebookNote, Paper, Stamp } from "@/components/ui/surfaces";
import { useFormDraft } from "@/lib/drafts/use-form-draft";

import { IDENTITY_STATUS_LABELS } from "@/features/identity/identity-state";

import { countryName, HAZARD_LABELS, ORDER_BAND_LABELS, UNIT_BAND_LABELS, WIZARD_STEPS } from "./display";
import { BusinessStep, ContactStep } from "./steps/business-steps";
import { DocumentsStep, IdentityStep, OperationsStep } from "./steps/evidence-steps";
import { patchForStep, valuesFrom, type WizardValues } from "./steps/wizard-values";
import type { useVerification } from "./use-verification";

type VerificationState = ReturnType<typeof useVerification>;

function withoutSecrets(values: WizardValues): Partial<WizardValues> {
  return { ...values, documents: {} };
}

export const IDENTITY_STEP = 2;

export function VerificationWizard({ view, state, initialStep = 0 }: { view: VerificationView; state: VerificationState; initialStep?: number }) {
  const [step, setStep] = useState(initialStep);
  const [values, setValues] = useState<WizardValues>(() => valuesFrom(view.draft));
  const draft = useFormDraft({ key: "verification", values, onRestore: setValues, keep: withoutSecrets });
  const set = (patch: Partial<WizardValues>) => setValues((current) => ({ ...current, ...patch }));
  const stepProps = { values, set, errors: state.errors, market: view.market };
  const last = step === WIZARD_STEPS.length - 1;

  function saveAndContinue() {
    state.save.mutate(patchForStep(step, values), {
      onSuccess: (next) => {
        const saved = { ...valuesFrom(next.draft), documents: values.documents };
        draft.settle(saved);
        setValues(saved);
        setStep((current) => Math.min(current + 1, WIZARD_STEPS.length - 1));
      },
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <Paper className="h-fit px-6 py-6">
        <Stepper steps={WIZARD_STEPS} current={step} />
      </Paper>
      <div className="flex max-w-[640px] flex-col gap-6">
        {view.status === "RESUBMISSION_REQUIRED" && view.decisionReason ? (
          <NotebookNote tone="pink" tilt="none">
            <Stamp className="text-cocoa">Our reviewer asked for changes</Stamp>
            <p className="mt-2 text-small">{view.decisionReason}</p>
          </NotebookNote>
        ) : null}
        <div>
          <div className="flex justify-between text-meta text-ink-faint">
            <span>Business verification</span>
            <span>
              Step {step + 1} of {WIZARD_STEPS.length}
            </span>
          </div>
          <div className="mb-[30px] mt-3.5">
            <SegmentedProgress total={WIZARD_STEPS.length} current={step} label="Verification progress" />
          </div>
          <h2 className="text-h2">{WIZARD_STEPS[step]?.title}</h2>
        </div>
        <DraftStatus draft={draft} />
        <FormAlert message={state.formError} />
        {step === 0 ? <BusinessStep {...stepProps} /> : null}
        {step === 1 ? <ContactStep {...stepProps} /> : null}
        {step === IDENTITY_STEP ? <IdentityStep check={view.identityCheck} /> : null}
        {step === 3 ? <DocumentsStep {...stepProps} view={view} /> : null}
        {step === 4 ? <OperationsStep {...stepProps} /> : null}
        {last ? <ReviewSummary view={view} /> : null}
        <div className="flex items-center justify-between gap-4 border-t border-line pt-6">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Back
          </Button>
          {last ? (
            <Button variant="yellow" size="lg" loading={state.submit.isPending} onClick={() => state.submit.mutate()}>
              Submit for review →
            </Button>
          ) : (
            <Button variant="yellow" size="lg" loading={state.save.isPending} onClick={saveAndContinue}>
              Save and continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSummary({ view }: { view: VerificationView }) {
  const draft = view.draft;
  const rows: Array<[string, string | undefined]> = [
    ["Business", draft.legalBusinessName],
    ["Registered in", draft.registrationCountryCode ? countryName(draft.registrationCountryCode) : undefined],
    ["Company number", draft.companyNumber],
    ["Address", [draft.registeredAddress?.line1, draft.registeredAddress?.city, draft.registeredAddress?.postalCode].filter(Boolean).join(", ") || undefined],
    ["Contact", [draft.contactFullName, draft.contactRole].filter(Boolean).join(" · ") || undefined],
    ["Phone", draft.contactPhone],
    ["Identity", view.identityCheck ? IDENTITY_STATUS_LABELS[view.identityCheck.status] : undefined],
    ["Business document", view.documents.some((document) => document.slot === "businessDocument" && document.status === "VERIFIED") ? "Uploaded" : undefined],
    ["Volumes", draft.monthlyUnits && draft.monthlyOrders ? `${UNIT_BAND_LABELS[draft.monthlyUnits]} · ${ORDER_BAND_LABELS[draft.monthlyOrders]}` : undefined],
    ["Handling", draft.hazards?.map((hazard) => HAZARD_LABELS[hazard]).join(", ")],
  ];
  return (
    <Paper className="px-6 py-2">
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-6 border-t border-line py-3 text-small first:border-t-0">
            <dt className="text-ink-soft">{label}</dt>
            <dd className={value ? "text-right text-ink" : "text-right text-danger"}>{value ?? "Missing"}</dd>
          </div>
        ))}
      </dl>
    </Paper>
  );
}
