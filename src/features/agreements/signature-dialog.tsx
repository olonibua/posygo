"use client";

import type { SignatureInput, SignatureMethod } from "@/shared";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input } from "@/components/ui/form-controls";
import { cn } from "@/lib/cn";

import { DrawPad, exportTypedSignature } from "./signature-pad";

interface SignatureDialogProps {
  defaultName: string;
  lockedName: boolean;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onAdopt: (signature: SignatureInput) => void;
}

const METHODS: Array<{ value: SignatureMethod; label: string }> = [
  { value: "DRAWN", label: "Draw" },
  { value: "TYPED", label: "Type" },
];

export function SignatureDialog({ defaultName, lockedName, busy, error, onCancel, onAdopt }: SignatureDialogProps) {
  const [method, setMethod] = useState<SignatureMethod>("DRAWN");
  const [name, setName] = useState(defaultName);
  const [drawn, setDrawn] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const trimmed = name.trim();
  const ready = consent && trimmed.length >= 2 && (method === "TYPED" || drawn !== null);

  async function adopt() {
    const image = method === "DRAWN" ? drawn : await exportTypedSignature(trimmed);
    if (image) {
      onAdopt({ method, name: trimmed, image, consent: true });
    }
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#0b1630]/60 p-4 print:hidden" role="dialog" aria-modal="true" aria-labelledby="adopt-heading">
      <div className="motion-pop w-full max-w-[600px] rounded-[14px] bg-white shadow-[0_30px_80px_-20px_#0b163080]">
        <div className="border-b border-line px-6 py-5">
          <h2 id="adopt-heading" className="text-[20px] font-semibold tracking-[-0.4px]">
            Adopt your signature
          </h2>
          <p className="mt-1 text-small text-ink-soft">Confirm your name, then draw or type your signature.</p>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <FormAlert message={error} />
          <Field label="Full name" hint={lockedName ? "Must match the name on your application." : undefined}>
            {({ id, describedBy }) => <Input id={id} autoComplete="name" aria-describedby={describedBy} value={name} onChange={(event) => setName(event.target.value)} />}
          </Field>
          <div role="tablist" aria-label="How to sign" className="inline-flex self-start rounded-control bg-paper-sunk p-1">
            {METHODS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={method === option.value}
                onClick={() => setMethod(option.value)}
                className={cn("rounded-[8px] px-5 py-2 text-small font-medium transition-colors duration-200", method === option.value ? "bg-white text-ink shadow-sm" : "text-ink-soft hover:text-ink")}
              >
                {option.label}
              </button>
            ))}
          </div>
          {method === "DRAWN" ? (
            <DrawPad onChange={setDrawn} />
          ) : (
            <div className="relative grid h-[150px] place-items-center overflow-hidden rounded-control border-[1.5px] border-dashed border-line-strong bg-white sm:h-[180px]">
              <span className="truncate px-6 font-signature text-[52px] leading-none text-seal sm:text-[64px]">{trimmed || "Your name"}</span>
              <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-9 border-b border-line-strong" />
            </div>
          )}
          <Checkbox
            label="I agree that this electronic signature is the legal equivalent of my handwritten signature on this agreement."
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="yellow" loading={busy} disabled={!ready} onClick={() => void adopt()}>
            Adopt and sign
          </Button>
        </div>
      </div>
    </div>
  );
}
