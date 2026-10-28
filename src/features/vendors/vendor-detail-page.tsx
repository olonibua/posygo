"use client";

import type { VendorMemberView } from "@/shared";

import { BackLink } from "@/components/ui/back-link";
import { StatusPill } from "@/components/ui/chip";
import { type Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/navigation-controls";
import { PageHeader } from "@/components/ui/page-header";
import { PageSkeleton } from "@/components/ui/skeleton";
import { StatTile, StatTileGrid } from "@/components/ui/stat-tile";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { countryName, VERIFICATION_STATUS_DISPLAY } from "@/features/onboarding/display";
import { formatDate, formatMoney, localeFor } from "@/lib/format";

import { productColumns } from "./directory-parts";
import { useVendorDetail } from "./use-vendor-directory";
import { MEMBER_ROLE_LABELS, VENDOR_STAGE_DISPLAY } from "./vendor-display";

const MEMBER_COLUMNS: readonly Column<VendorMemberView>[] = [
  { key: "email", header: "Email", render: (row) => row.email },
  { key: "role", header: "Role", render: (row) => MEMBER_ROLE_LABELS[row.role] ?? row.role },
  { key: "email-check", header: "Email confirmed", render: (row) => (row.emailVerified ? "Yes" : <span className="text-ink-faint">Not yet</span>) },
  { key: "joined", header: "Joined", render: (row) => <span className="text-ink-soft">{formatDate(row.joinedAt, "en-GB")}</span> },
];

const PRODUCT_COLUMNS = productColumns({ showVendor: false });

export function VendorDetailPage({ vendorId }: { vendorId: string }) {
  const detail = useVendorDetail(vendorId);
  const vendor = detail.data;
  if (!vendor) {
    return detail.isError ? <p className="text-ink-soft">{"This vendor isn't available to you."}</p> : <PageSkeleton />;
  }
  const locale = localeFor(vendor.countryCode);
  const stage = VENDOR_STAGE_DISPLAY[vendor.stage];
  const verification = VERIFICATION_STATUS_DISPLAY[vendor.verification.status];

  return (
    <div className="flex flex-col gap-7">
      <BackLink href="/admin/vendors">All vendors</BackLink>
      <PageHeader
        stamp={`${countryName(vendor.countryCode)} · joined ${formatDate(vendor.joinedAt, locale)}`}
        title={vendor.businessName}
        action={
          <span className="flex flex-wrap gap-2">
            <StatusPill tone={stage.tone}>{stage.label}</StatusPill>
            {vendor.isTestAccount ? <StatusPill tone="cocoa">Test account</StatusPill> : null}
          </span>
        }
      />
      <StatTileGrid>
        <StatTile tone="lime" label="Wallet" value={formatMoney(vendor.wallet.balanceMinor, vendor.wallet.currency, locale)} note="Current balance" dots={["orange"]} />
        <StatTile tone="sky" label="Products" value={vendor.counts.products} note={`${vendor.unitsInStorage} units in storage`} dots={["yellow"]} />
        <StatTile tone="yellow" label="Stock shipments" value={vendor.counts.inboundShipments} note="Sent in so far" dots={["pink"]} />
        <StatTile tone="pink" label="Orders" value={vendor.counts.orders} note="Placed so far" dots={["teal"]} />
      </StatTileGrid>
      <div className="grid gap-4 md:grid-cols-2">
        <Paper className="px-6 py-5 text-small">
          <Stamp>Verification</Stamp>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-ink-faint">Status</dt>
              <dd>
                <StatusPill tone={verification.tone}>{verification.label}</StatusPill>
              </dd>
            </div>
            <div>
              <dt className="text-ink-faint">Sent for review</dt>
              <dd>{vendor.verification.submittedAt ? formatDate(vendor.verification.submittedAt, locale) : "—"}</dd>
            </div>
            <div>
              <dt className="text-ink-faint">Decided</dt>
              <dd>{vendor.verification.decidedAt ? formatDate(vendor.verification.decidedAt, locale) : "—"}</dd>
            </div>
          </dl>
        </Paper>
        <Paper className="px-6 py-5 text-small">
          <Stamp>Countries</Stamp>
          <p className="mt-3">{vendor.countries.map((code) => countryName(code)).join(", ")}</p>
          <p className="mt-1 text-ink-faint">Home country first, then the other countries they store stock in.</p>
        </Paper>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="text-h3">Team</h2>
        <DataTable caption="Team" columns={MEMBER_COLUMNS} rows={vendor.members} rowKey={(row) => row.userId} empty={<EmptyState title="No team" body="Nobody has an account for this business." />} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-h3">Products</h2>
        <DataTable
          caption="Products"
          columns={PRODUCT_COLUMNS}
          rows={vendor.products}
          rowKey={(row) => row.id}
          empty={<EmptyState title="No products yet" body="Products this business adds appear here." />}
        />
      </section>
    </div>
  );
}
