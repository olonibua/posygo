"use client";

import type { ProductView } from "@/shared";
import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { FileDrop } from "@/components/ui/file-drop";
import { FormAlert } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { uploadPrivateFile } from "@/lib/api/uploads";

import { useFormErrors } from "./form-errors";
import { BarcodeFields, CustomsFields, IdentityFields, SizeFields } from "./product-fields";
import { emptyProduct, productToValues, type ProductValues, unitsFor, valuesToInput } from "./product-values";
import type { Market } from "./use-market";

interface ProductFormProps {
  market: Market;
  product?: ProductView;
  readOnly: boolean;
  submitLabel: string;
  onSave: (input: ReturnType<typeof valuesToInput>) => Promise<unknown>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Paper className="flex flex-col gap-5 px-6 py-6">
      <Stamp as="h2">{title}</Stamp>
      {children}
    </Paper>
  );
}

export function ProductForm({ market, product, readOnly, submitLabel, onSave }: ProductFormProps) {
  const [values, setValues] = useState<ProductValues>(() => (product ? productToValues(product, market) : emptyProduct(market)));
  const [saving, setSaving] = useState(false);
  const { formError, capture, reset, errorFor } = useFormErrors();
  const set = (patch: Partial<ProductValues>) => setValues((current) => ({ ...current, ...patch }));
  const fieldProps = { values, set, errorFor, readOnly };

  async function submit(event: FormEvent) {
    event.preventDefault();
    reset();
    setSaving(true);
    try {
      await onSave(valuesToInput(values, market));
    } catch (error) {
      capture(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="flex max-w-[880px] flex-col gap-5" noValidate>
      <FormAlert message={formError} />
      <Section title="What it is">
        <IdentityFields {...fieldProps} />
      </Section>
      <Section title="Value and customs">
        <CustomsFields {...fieldProps} currency={market.currency} />
      </Section>
      <Section title="Size and weight">
        <SizeFields {...fieldProps} units={unitsFor(market)} />
      </Section>
      <Section title="Barcodes">
        <BarcodeFields {...fieldProps} />
      </Section>
      {readOnly ? null : (
        <Section title="Photo">
          <FileDrop
            label="Product photo"
            hint="Optional. JPG, PNG or WEBP under 5 MB. Helps the hub recognise it."
            accept="image/jpeg,image/png,image/webp"
            initialState={values.imageFileId ? "VERIFIED" : "EMPTY"}
            error={errorFor("imageFileId")}
            onFile={async (file) => set({ imageFileId: await uploadPrivateFile(file, "PRODUCT_IMAGE") })}
          />
        </Section>
      )}
      {readOnly ? null : (
        <div className="flex justify-end">
          <Button type="submit" variant="yellow" size="lg" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
