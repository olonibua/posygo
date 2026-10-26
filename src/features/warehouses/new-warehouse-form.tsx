"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FormAlert, Input, Select } from "@/components/ui/form-controls";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { fieldError, formError } from "@/features/receiving/api-errors";
import { apiRequest } from "@/lib/api/client";

import { WAREHOUSES_KEY } from "./use-warehouses";

const EMPTY = { countryCode: "", code: "", name: "", line1: "", line2: "", city: "", postalCode: "" };

export function NewWarehouseForm() {
  const queryClient = useQueryClient();
  const countries = useAdminCountries();
  const [values, setValues] = useState(EMPTY);
  const set = (patch: Partial<typeof EMPTY>) => setValues((current) => ({ ...current, ...patch }));
  const create = useMutation({
    mutationFn: () =>
      apiRequest("/v1/warehouse/warehouses", {
        method: "POST",
        body: {
          countryCode: values.countryCode,
          code: values.code,
          name: values.name,
          addressLines: [values.line1, values.line2].filter((line) => line.trim().length > 0),
          city: values.city,
          postalCode: values.postalCode,
        },
      }),
    onSuccess: () => {
      setValues(EMPTY);
      void queryClient.invalidateQueries({ queryKey: WAREHOUSES_KEY });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    create.mutate();
  }

  const error = (field: string) => fieldError(create.error, field);
  return (
    <Paper className="px-6 py-6">
      <Stamp>New warehouse</Stamp>
      <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FormAlert message={formError(create.error)} />
        </div>
        <Field label="Country" error={error("countryCode")}>
          {({ id, invalid }) => (
            <Select id={id} aria-invalid={invalid} value={values.countryCode} onChange={(event) => set({ countryCode: event.target.value })}>
              <option value="">Choose a country</option>
              {(countries.data ?? []).map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Warehouse code" hint="Short and unique, for example MAN-1." error={error("code")}>
          {({ id, describedBy, invalid }) => (
            <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} value={values.code} maxLength={16} onChange={(event) => set({ code: event.target.value })} />
          )}
        </Field>
        <Field label="Name" error={error("name")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={values.name} maxLength={80} onChange={(event) => set({ name: event.target.value })} />}
        </Field>
        <Field label="Address" error={error("addressLines")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={values.line1} maxLength={120} onChange={(event) => set({ line1: event.target.value })} />}
        </Field>
        <Field label="Address line 2" hint="Optional.">
          {({ id, describedBy }) => <Input id={id} aria-describedby={describedBy} value={values.line2} maxLength={120} onChange={(event) => set({ line2: event.target.value })} />}
        </Field>
        <Field label="Town or city" error={error("city")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={values.city} maxLength={80} onChange={(event) => set({ city: event.target.value })} />}
        </Field>
        <Field label="Postcode" error={error("postalCode")}>
          {({ id, invalid }) => <Input id={id} aria-invalid={invalid} value={values.postalCode} maxLength={16} onChange={(event) => set({ postalCode: event.target.value })} />}
        </Field>
        <div className="flex items-end justify-end md:col-span-2">
          <Button type="submit" variant="yellow" loading={create.isPending}>
            Add warehouse
          </Button>
        </div>
      </form>
    </Paper>
  );
}
