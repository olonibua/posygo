import type { ReactNode } from "react";

import { MarketingFooter, MarketingHeader } from "@/components/layout/marketing-chrome";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Paper, Stamp } from "@/components/ui/surfaces";
import { BRAND } from "@/lib/brand";
import { publicPage } from "@/lib/site";

export const metadata = publicPage({
  title: "Contact",
  description: `Contact ${BRAND.name}. Email ${BRAND.contactEmail} about storing your stock and delivering your orders. ${BRAND.supportPromise}`,
  path: "/contact",
});

function Option({ stamp, title, children, action }: { stamp: string; title: string; children: ReactNode; action: ReactNode }) {
  return (
    <Paper className="flex flex-col gap-3 px-6 py-6">
      <Stamp>{stamp}</Stamp>
      <h2 className="text-h3 font-semibold">{title}</h2>
      <p className="text-small text-ink-soft">{children}</p>
      <div className="mt-auto pt-2">{action}</div>
    </Paper>
  );
}

export default function Page() {
  return (
    <>
      <MarketingHeader />
      <main id="main" className="mx-auto flex max-w-container flex-col gap-8 px-4 py-14 sm:px-8">
        <PageHeader stamp="Contact" title="Talk to us" lead={BRAND.supportPromise} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Option stamp="Email" title={BRAND.contactEmail} action={<ButtonLink href={`mailto:${BRAND.contactEmail}`} variant="yellow">Email us</ButtonLink>}>
            Questions about storing your stock, prices, or the countries we deliver in.
          </Option>
          <Option stamp="Sellers" title="Already selling with us?" action={<ButtonLink href="/login" variant="ghost">Sign in</ButtonLink>}>
            Sign in and message us from your account. Your orders and stock come with your message, so we can help faster.
          </Option>
          <Option stamp="Parcels" title="Waiting for a parcel?" action={<ButtonLink href="/track" variant="ghost">Track a parcel</ButtonLink>}>
            Track it with the number from your shipping email. For anything else about your order, contact the shop you bought from.
          </Option>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
