"use client";

import { hasPermission } from "@/shared";

import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FeaturePanel } from "@/components/ui/surfaces";
import { CountriesSummary } from "@/features/countries/admin-countries";
import { PartnershipPage } from "@/features/partners/portal/partnership-page";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { greetingFor } from "@/lib/format";

import { NetworkPulse } from "./network-pulse";

export function ConsoleOverview() {
  const user = useCurrentUser();
  if (user.partnerId) {
    return <PartnershipPage />;
  }
  const canSeeCountries = hasPermission(user.role, "countries.read");
  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        stamp="Network oversight"
        title={`${greetingFor(new Date())}`}
        lead={user.countryCode ? "What needs doing in your market, and how it's going." : "What needs doing across the network, and how every market is going."}
        action={
          canSeeCountries ? (
            <ButtonLink href="/admin/countries" variant="yellow" size="lg">
              Manage countries →
            </ButtonLink>
          ) : null
        }
      />
      <NetworkPulse />
      {canSeeCountries ? <CountriesSummary /> : null}
      <FeaturePanel tone="lime" stamp="Signed in with two-factor" title="Every action here is on the record.">
        What you approve, change or open is written to a tamper-evident audit log.
      </FeaturePanel>
    </div>
  );
}
