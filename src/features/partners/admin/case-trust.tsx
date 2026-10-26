"use client";

import type { CreateMysteryOrderInput, MysteryProductView, PartnerDetailView, StockCountView } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { toast } from "@/lib/toast/toast-store";

import { TrustCard } from "@/features/custody/trust-card";

import { ScorecardPanel } from "../partner-parts";
import { useAdminPartnerMutation, usePartnerScorecard } from "../use-partners";

export function TrustSection({ partner, canReview, canManage }: { partner: PartnerDetailView; canReview: boolean; canManage: boolean }) {
  const scorecard = usePartnerScorecard(partner.id);
  const live = partner.status === "ACTIVE";
  return (
    <section aria-labelledby="trust-heading" className="flex flex-col gap-4">
      <h2 id="trust-heading" className="text-h3">
        Performance and checks
      </h2>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ScorecardPanel scorecard={scorecard.data} tierName={partner.tier.name} />
        <TrustCard partnerId={partner.id} audience="STAFF" />
      </div>
      {live && (canReview || canManage) ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {canReview ? <StockCountRequest partnerId={partner.id} /> : null}
          {canManage ? <MysteryOrderForm partner={partner} /> : null}
        </div>
      ) : null}
    </section>
  );
}

function StockCountRequest({ partnerId }: { partnerId: string }) {
  const [lines, setLines] = useState("10");
  const [hours, setHours] = useState("48");
  const request = useAdminPartnerMutation<{ lines: number; dueInHours: number }, StockCountView>((input) => ({ path: `/v1/admin/partners/${partnerId}/stock-counts`, body: input }));
  return (
    <Paper className="flex flex-col gap-3 px-6 py-5">
      <Stamp>Surprise stock count</Stamp>
      <p className="text-small text-ink-soft">We pick lines at random. The partner films the count without seeing our numbers, and differences are flagged automatically.</p>
      <FormAlert message={formError(request.error)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Lines to count" error={fieldError(request.error, "lines")}>
          {({ id, invalid }) => <Input id={id} inputMode="numeric" aria-invalid={invalid} value={lines} onChange={(event) => setLines(event.target.value.replace(/\D/g, ""))} />}
        </Field>
        <Field label="Due within (hours)" error={fieldError(request.error, "dueInHours")}>
          {({ id, invalid }) => <Input id={id} inputMode="numeric" aria-invalid={invalid} value={hours} onChange={(event) => setHours(event.target.value.replace(/\D/g, ""))} />}
        </Field>
      </div>
      <div className="flex justify-end">
        <Button
          variant="lime"
          loading={request.isPending}
          onClick={() =>
            request.mutate(
              { lines: Number(lines), dueInHours: Number(hours) },
              { onSuccess: (count) => toast.success("Stock count requested", `${count.lines.length} lines. The partner has been emailed.`) },
            )
          }
        >
          Request count
        </Button>
      </div>
    </Paper>
  );
}

function MysteryOrderForm({ partner }: { partner: PartnerDetailView }) {
  const [form, setForm] = useState({ productId: "", quantity: "1", name: "", line1: "", city: "", postalCode: "" });
  const products = useQuery({
    queryKey: ["admin", "mystery-products", partner.countryCode],
    queryFn: () => apiRequest<MysteryProductView[]>(`/v1/admin/partners/${partner.id}/mystery-orders/products`),
    retry: false,
  });
  const create = useAdminPartnerMutation<CreateMysteryOrderInput, unknown>((input) => ({ path: `/v1/admin/partners/${partner.id}/mystery-orders`, body: input }));
  const set = (patch: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      { productId: form.productId, quantity: Number(form.quantity), recipient: { name: form.name, line1: form.line1, city: form.city, postalCode: form.postalCode, countryCode: partner.countryCode } },
      { onSuccess: () => toast.success("Test order placed", "Record the result under Test orders once it arrives.") },
    );
  }

  return (
    <Paper className="px-6 py-5">
      <Stamp>Test order</Stamp>
      <p className="mt-2 text-small text-ink-soft">Places a normal-looking order from the country&apos;s test vendor to an address we control, so we can check what arrives.</p>
      <form noValidate onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormAlert
            message={
              formError(create.error) ??
              (products.isError ? "Set up the country's test vendor first, with stock at this hub." : products.data?.length === 0 ? "The test vendor has no stock at this hub yet." : null)
            }
          />
        </div>
        <Field label="Product">
          {({ id }) => (
            <Select id={id} value={form.productId} onChange={(event) => set({ productId: event.target.value })}>
              <option value="">Choose a product</option>
              {(products.data ?? []).map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.name} ({product.code}) · {product.available} in stock
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Quantity" error={fieldError(create.error, "quantity")}>
          {({ id, invalid }) => <Input id={id} inputMode="numeric" aria-invalid={invalid} value={form.quantity} onChange={(event) => set({ quantity: event.target.value.replace(/\D/g, "") })} />}
        </Field>
        <Field label="Recipient name" error={fieldError(create.error, "recipient.name")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.name} onChange={(event) => set({ name: event.target.value })} />}
        </Field>
        <Field label="Address" error={fieldError(create.error, "recipient.line1")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.line1} onChange={(event) => set({ line1: event.target.value })} />}
        </Field>
        <Field label="City" error={fieldError(create.error, "recipient.city")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.city} onChange={(event) => set({ city: event.target.value })} />}
        </Field>
        <Field label="Postcode" error={fieldError(create.error, "recipient.postalCode")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={form.postalCode} onChange={(event) => set({ postalCode: event.target.value })} />}
        </Field>
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" variant="lime" loading={create.isPending} disabled={!form.productId}>
            Place test order
          </Button>
        </div>
      </form>
    </Paper>
  );
}
