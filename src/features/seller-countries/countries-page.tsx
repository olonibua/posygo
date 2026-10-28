"use client";

import { type AddVendorCountryInput, hasPermission, type PublicCountry, type VendorCountryView } from "@/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, FormAlert, Select } from "@/components/ui/form-controls";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonLines } from "@/components/ui/skeleton";
import { Paper } from "@/components/ui/surfaces";
import { ApiError, apiRequest } from "@/lib/api/client";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, localeFor } from "@/lib/format";
import { toast } from "@/lib/toast/toast-store";

import { countryFlag } from "./country-flag";
import { useSelectedCountry, VENDOR_COUNTRIES_KEY } from "./selected-country";

export function CountriesPage() {
  const user = useCurrentUser();
  const canAdd = hasPermission(user.role, "vendor.markets.manage");
  const { countries, loading } = useSelectedCountry();
  const locale = localeFor(user.countryCode);

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Countries" title="Where you store stock" lead="Each country has its own stock, orders and wallet. Orders are sent from stock in the same country." />
      {canAdd ? <AddCountry added={countries} /> : null}
      {loading ? (
        <SkeletonLines lines={3} />
      ) : (
        <ul className="stagger grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {countries.map((country) => (
            <li key={country.code} className="motion-rise">
              <Paper className="flex h-full flex-col gap-2 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[17px] font-medium">
                    <span aria-hidden>{countryFlag(country.code)}</span> {country.name}
                  </p>
                  {country.home ? (
                    <Chip tone="lime" size="sm">
                      Home
                    </Chip>
                  ) : null}
                </div>
                <p className="text-small text-ink-soft">Wallet in {country.currency}</p>
                <p className="text-meta text-ink-faint">Added {formatDate(country.addedAt, locale)}</p>
              </Paper>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddCountry({ added }: { added: readonly VendorCountryView[] }) {
  const queryClient = useQueryClient();
  const { select } = useSelectedCountry();
  const [countryCode, setCountryCode] = useState("");
  const open = useQuery({ queryKey: ["countries", "live"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }) });
  const available = (open.data ?? []).filter((country) => !added.some((entry) => entry.code === country.code));
  const add = useMutation({
    mutationFn: (input: AddVendorCountryInput) => apiRequest<VendorCountryView[]>("/v1/vendor/countries", { method: "POST", body: input }),
    onSuccess: (next, input) => {
      queryClient.setQueryData(VENDOR_COUNTRIES_KEY, next);
      void queryClient.invalidateQueries({ queryKey: VENDOR_COUNTRIES_KEY });
      const country = next.find((entry) => entry.code === input.countryCode);
      setCountryCode("");
      select(input.countryCode);
      toast.success(`${country?.name ?? input.countryCode} added`, "You can send stock there now.");
    },
  });
  const fieldError = add.error instanceof ApiError ? add.error.fieldErrors.countryCode?.[0] : undefined;

  return (
    <Paper className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1">
        <Field label="Add a country" hint={available.length === 0 && !open.isLoading ? "You already store stock in every open country." : "It opens straight away."} error={fieldError}>
          {({ id, describedBy, invalid }) => (
            <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} value={countryCode} disabled={available.length === 0} onChange={(event) => setCountryCode(event.target.value)}>
              <option value="" disabled>
                {open.isLoading ? "Loading countries…" : "Choose a country"}
              </option>
              {available.map((country) => (
                <option key={country.code} value={country.code}>
                  {countryFlag(country.code)} {country.name} · {country.currency}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <FormAlert message={add.error instanceof ApiError && !fieldError ? add.error.message : null} />
      </div>
      <Button variant="yellow" size="lg" loading={add.isPending} disabled={!countryCode} onClick={() => add.mutate({ countryCode })}>
        Add country
      </Button>
    </Paper>
  );
}
