"use client";

import { roleScope, VENDOR_STAGES, type VendorRowView, type VendorStage } from "@/shared";
import { useDeferredValue, useState } from "react";

import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { EmptyState, FilterTabs, OpenLink } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { useAdminCountries } from "@/features/countries/admin-countries";
import { countryName } from "@/features/onboarding/display";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { DirectoryPager } from "./directory-parts";
import { useVendorDirectory } from "./use-vendor-directory";
import { VENDOR_STAGE_DISPLAY } from "./vendor-display";

type StageFilter = "ALL" | VendorStage;

const STAGE_FILTERS: ReadonlyArray<{ value: StageFilter; label: string }> = [{ value: "ALL", label: "All" }, ...VENDOR_STAGES.map((stage) => ({ value: stage, label: VENDOR_STAGE_DISPLAY[stage].label }))];

const COLUMNS: readonly Column<VendorRowView>[] = [
  {
    key: "business",
    header: "Business",
    render: (row) => (
      <span>
        <span className="block font-medium">{row.businessName}</span>
        <span className="text-meta text-ink-faint">{row.ownerEmail ?? "No owner"}</span>
      </span>
    ),
  },
  { key: "country", header: "Country", render: (row) => countryName(row.countryCode) },
  { key: "stage", header: "Stage", render: (row) => <StatusPill tone={VENDOR_STAGE_DISPLAY[row.stage].tone}>{VENDOR_STAGE_DISPLAY[row.stage].label}</StatusPill> },
  { key: "products", header: "Products", align: "right", render: (row) => row.productCount },
  { key: "stored", header: "In storage", align: "right", render: (row) => row.unitsInStorage },
  { key: "wallet", header: "Wallet", align: "right", render: (row) => formatMoney(row.walletBalanceMinor, row.currency, localeFor(row.countryCode)) },
  { key: "joined", header: "Joined", render: (row) => <span className="text-ink-soft">{formatDate(row.joinedAt, "en-GB")}</span> },
  { key: "open", header: "", align: "right", render: (row) => <OpenLink href={`/admin/vendors/${row.id}`} /> },
];

export function VendorsPage() {
  const user = useCurrentUser();
  const everyCountry = roleScope(user.role) === "PLATFORM";
  const countries = useAdminCountries(everyCountry);
  const [stage, setStage] = useState<StageFilter>("ALL");
  const [country, setCountry] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const q = useDeferredValue(search.trim());
  const vendors = useVendorDirectory({ q: q || undefined, country: country || undefined, stage: stage === "ALL" ? undefined : stage, page });
  const filterBy = <Value,>(set: (value: Value) => void) => (value: Value) => {
    set(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-7">
      <PageHeader stamp="Network" title="Vendors" lead="Every business that has signed up, from new accounts to live sellers. Open one to see its team, products and wallet." />
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <FilterTabs label="Filter by stage" options={STAGE_FILTERS} value={stage} onChange={filterBy(setStage)} />
        <div className="flex flex-col gap-3 sm:flex-row">
          {everyCountry ? (
            <div className="sm:w-[200px]">
              <Field label="Country">
                {({ id }) => (
                  <Select id={id} value={country} onChange={(event) => filterBy(setCountry)(event.target.value)}>
                    <option value="">All countries</option>
                    {(countries.data ?? []).map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          ) : null}
          <div className="sm:w-[280px]">
            <Field label="Search vendors">
              {({ id }) => <Input id={id} type="search" placeholder="Business name or owner email" value={search} maxLength={100} onChange={(event) => filterBy(setSearch)(event.target.value)} />}
            </Field>
          </div>
        </div>
      </div>
      <DataTable
        caption="Vendors"
        columns={COLUMNS}
        rows={vendors.data?.items ?? []}
        rowKey={(row) => row.id}
        loading={vendors.isLoading}
        empty={<EmptyState title="No vendors here" body="Businesses appear here as soon as they sign up." />}
      />
      {vendors.data ? <DirectoryPager page={vendors.data.page} pageSize={vendors.data.pageSize} total={vendors.data.total} onChange={setPage} /> : null}
    </div>
  );
}
