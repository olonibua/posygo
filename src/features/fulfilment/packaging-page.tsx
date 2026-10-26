"use client";

import { hasPermission, PACKAGING_KINDS, type PackagingKind, type PackagingPresetInput, type PackagingPresetView } from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { formatSize } from "@/features/orders/order-display";
import { errorMessage, fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";

import { usePackaging } from "./use-fulfilment";

const KIND_LABELS: Record<PackagingKind, string> = { BOX: "Box", MAILER: "Mailer" };

function centimetres(text: string): number {
  return Math.round((Number.parseFloat(text) || 0) * 10);
}

export function PackagingPage() {
  const user = useCurrentUser();
  const canManage = hasPermission(user.role, "packaging.manage");
  const countries = useAdminCountries(!user.countryCode);
  const [chosen, setChosen] = useState("");
  const countryCode = chosen || user.countryCode || countries.data?.[0]?.code || "";
  const presets = usePackaging(countryCode || null);
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["warehouse", "packaging", countryCode] });
  const create = useMutation({
    mutationFn: (input: PackagingPresetInput) => apiRequest<PackagingPresetView>(`/v1/admin/packaging/${countryCode}`, { method: "POST", body: input }),
    onSuccess: refresh,
  });
  const toggle = useMutation({
    mutationFn: (preset: PackagingPresetView) =>
      apiRequest<PackagingPresetView>(`/v1/admin/packaging/presets/${preset.id}`, {
        method: "PUT",
        body: { code: preset.code, label: preset.label, kind: preset.kind, lengthMm: preset.lengthMm, widthMm: preset.widthMm, heightMm: preset.heightMm, active: !preset.active },
      }),
    onSuccess: refresh,
  });
  const [draft, setDraft] = useState({ code: "", label: "", kind: "BOX" as PackagingKind, length: "", width: "", height: "" });

  function submit(event: FormEvent) {
    event.preventDefault();
    create.mutate(
      {
        code: draft.code.trim(),
        label: draft.label.trim(),
        kind: draft.kind,
        lengthMm: centimetres(draft.length),
        widthMm: centimetres(draft.width),
        heightMm: centimetres(draft.height),
        active: true,
      },
      { onSuccess: () => setDraft({ code: "", label: "", kind: draft.kind, length: "", width: "", height: "" }) },
    );
  }

  const columns: Column<PackagingPresetView>[] = [
    { key: "label", header: "Package", render: (preset) => <span className="font-medium">{preset.label}</span> },
    { key: "code", header: "Code", render: (preset) => <span className="font-mono">{preset.code}</span> },
    { key: "kind", header: "Type", render: (preset) => KIND_LABELS[preset.kind] },
    { key: "size", header: "Size", render: (preset) => formatSize(preset.lengthMm, preset.widthMm, preset.heightMm) },
    { key: "status", header: "Status", render: (preset) => (preset.active ? <StatusPill tone="lime">In use</StatusPill> : <StatusPill tone="cocoa">Retired</StatusPill>) },
    {
      key: "action",
      header: "",
      align: "right",
      render: (preset) =>
        canManage ? (
          <Button variant="ghost" loading={toggle.isPending && toggle.variables?.id === preset.id} onClick={() => toggle.mutate(preset)}>
            {preset.active ? "Retire" : "Bring back"}
          </Button>
        ) : null,
    },
  ];

  const centimetreField = (key: "length" | "width" | "height", label: string) => (
    <Field label={label} error={fieldError(create.error, `${key}Mm`)}>
      {({ id, invalid }) => <Input id={id} inputMode="decimal" aria-invalid={invalid} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />}
    </Field>
  );

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Warehouse" title="Packaging" lead="The boxes and mailers packers choose from. Their sizes go to the carrier with the weighed parcel, so keep them accurate." />
      {!user.countryCode ? (
        <div className="max-w-[320px]">
          <Field label="Market">
            {({ id }) => (
              <Select id={id} value={countryCode} onChange={(event) => setChosen(event.target.value)}>
                {(countries.data ?? []).map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      ) : null}
      <FormAlert message={errorMessage(toggle.error)} />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <DataTable
          caption="Packaging"
          columns={columns}
          rows={presets.data ?? []}
          rowKey={(preset) => preset.id}
          loading={presets.isLoading}
          empty={<EmptyState title="No packaging yet" body="Add the boxes and mailers this market's warehouses stock." />}
        />
        {canManage ? (
          <Paper className="px-6 py-6">
            <Stamp>Add packaging</Stamp>
            <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
              <FormAlert message={formError(create.error)} />
              <Field label="Name" error={fieldError(create.error, "label")}>
                {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={draft.label} maxLength={60} onChange={(event) => setDraft({ ...draft, label: event.target.value })} />}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code" error={fieldError(create.error, "code")}>
                  {({ id, invalid }) => (
                    <Input id={id} aria-invalid={invalid} value={draft.code} maxLength={24} onChange={(event) => setDraft({ ...draft, code: event.target.value })} className="font-mono" />
                  )}
                </Field>
                <Field label="Type">
                  {({ id }) => (
                    <Select id={id} value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as PackagingKind })}>
                      {PACKAGING_KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {KIND_LABELS[kind]}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {centimetreField("length", "Length (cm)")}
                {centimetreField("width", "Width (cm)")}
                {centimetreField("height", "Height (cm)")}
              </div>
              <Button type="submit" variant="yellow" loading={create.isPending}>
                Add packaging
              </Button>
            </form>
          </Paper>
        ) : null}
      </div>
    </div>
  );
}
