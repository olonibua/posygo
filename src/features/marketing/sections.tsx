import type { HubView } from "@/shared";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { NotebookNote, Stamp, StepNumber, Sticker } from "@/components/ui/surfaces";
import type { Tone } from "@/components/ui/tone";
import { formatMoney, localeFor } from "@/lib/format";

import { countryPath } from "./markets";

const TRUST_POINTS: ReadonlyArray<{ title: string; body: string; tone: Tone }> = [
  { title: "Vetted local hubs", body: "Identity, address and referee checks before a hub takes any stock.", tone: "sky" },
  { title: "Real-time tracking", body: "Every box, unit and parcel is logged as it moves.", tone: "lime" },
  { title: "Photo proof on every order", body: "A photo of each sealed parcel before it leaves the hub.", tone: "yellow" },
  { title: "Insured stock", body: "We hold the cover for your stock while it's in a hub.", tone: "pink" },
];

const STEPS = [
  { title: "Choose your hubs.", body: "Pick the countries you sell to. Each has vetted local fulfilment partners, tracked in real time and insured.", tone: "yellow", tilt: "left" },
  { title: "Send your stock.", body: "Declare the shipment and send it in. Every box is counted and photographed when it arrives.", tone: "lime", tilt: "right" },
  { title: "Sell as usual.", body: "Orders come in from your shop or a spreadsheet. The hub picks, packs and photographs each parcel.", tone: "sky", tilt: "slight" },
  { title: "Customers get it in days.", body: "Parcels go out with a local carrier and tracking, so delivery is quick and you can see every step.", tone: "pink", tilt: "left" },
] as const;

const SAFEGUARDS: ReadonlyArray<{ label: string; tone: Tone }> = [
  { label: "Identity-checked partners", tone: "sky" },
  { label: "Referees we contact", tone: "magenta" },
  { label: "Photo evidence", tone: "lime" },
  { label: "Insured stock", tone: "blue" },
  { label: "Surprise stock counts", tone: "orange" },
  { label: "Test orders", tone: "yellow" },
  { label: "Stock limits that grow with trust", tone: "cocoa" },
  { label: "Signed agreements", tone: "pink" },
];

export function TrustStrip() {
  return (
    <section aria-label="Why vendors trust us" className="pt-10 sm:pt-14">
      <ul className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_POINTS.map((point) => (
          <li key={point.title} className="motion-rise motion-lift rounded-card bg-paper px-5 py-4 shadow-[inset_0_0_0_1.5px_var(--line)]">
            <Chip tone={point.tone}>{point.title}</Chip>
            <p className="mt-2.5 text-small text-ink-soft">{point.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="pt-24 sm:pt-[120px]">
      <Stamp>How it works</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">From your supplier to your customer&apos;s door.</h2>
      <div className="mt-14 grid gap-[28px] md:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step, index) => (
          <NotebookNote key={step.title} tone={step.tone} tilt={step.tilt} className={index % 2 === 1 ? "min-h-[260px] pt-[26px] xl:mt-[26px]" : "min-h-[260px] pt-[26px]"}>
            <StepNumber value={index + 1} />
            <h3 className="mb-2.5 mt-[18px] text-[26px] font-medium leading-[28px] tracking-[-0.9px]">{step.title}</h3>
            <p className="text-[15px] leading-[22px]">{step.body}</p>
          </NotebookNote>
        ))}
      </div>
    </section>
  );
}

export function TrustBand() {
  return (
    <section id="trust" className="pt-24 sm:pt-[120px]">
      <div className="grain relative grid items-end gap-10 overflow-hidden rounded-band bg-cocoa px-6 py-12 text-on-ink md:grid-cols-[1.2fr_1fr] md:gap-[60px] md:px-16 md:py-[70px]">
        <Sticker src="/brand/badge-scallop-orange.svg" className="motion-wobble pointer-events-auto -left-6 -top-8 hidden w-[150px] -rotate-[8deg] md:block" />
        <Sticker src="/brand/sticker-flower-pink.svg" className="right-10 top-8 w-[86px] rotate-[10deg]" />
        <h2 className="relative text-[40px] font-medium leading-[42px] tracking-[-1.6px] text-on-ink md:mt-16 md:text-[58px] md:leading-[58px] md:tracking-[-2.4px]">
          How safe is your stock at a hub?
        </h2>
        <div className="relative">
          <p className="mb-[22px] text-[17px] leading-[26px] text-on-ink-soft">
            Hubs are run by vetted local fulfilment partners. New partners start with low-value stock and a low limit, and earn more as their record builds. Part of their pay is held back for months,
            and we hold the insurance.
          </p>
          <div className="stagger flex flex-wrap gap-2.5">
            {SAFEGUARDS.map((item) => (
              <span key={item.label} className="motion-pop">
                <Chip tone={item.tone} size="lg">
                  {item.label}
                </Chip>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HubsBand({ hubs }: { hubs: readonly HubView[] }) {
  return (
    <section id="hubs" className="pt-24 sm:pt-[120px]">
      <div className="relative grid gap-10 overflow-hidden rounded-band bg-blue px-6 py-12 text-white md:grid-cols-[1fr_1.1fr] md:px-16 md:py-[70px]">
        <div>
          <span className="text-stamp uppercase text-white/80">Fulfilment hubs</span>
          <h2 className="mt-3.5 text-[44px] font-medium leading-[46px] tracking-[-1.8px] text-white md:text-[58px] md:leading-[58px]">Where you can store stock today</h2>
          <p className="mt-5 max-w-[420px] text-lead text-white/90">We open hubs in a country once local partners pass our checks. Only live hubs are shown here.</p>
        </div>
        <div className="flex flex-col gap-[22px]">
          {hubs.length === 0 ? (
            <NotebookNote tone="yellow">
              <h3 className="mb-1.5 mt-2.5 text-[24px] font-medium tracking-[-0.6px]">Opening soon</h3>
              <p className="text-small">Our first hubs are being set up.</p>
            </NotebookNote>
          ) : (
            hubs.map((hub, index) => (
              <NotebookNote
                key={hub.countryCode}
                tone={index % 2 === 0 ? "yellow" : "lime"}
                tilt={index % 2 === 0 ? "left" : "right"}
                className="relative w-full max-w-[420px] md:odd:ml-0 md:even:ml-[90px]"
              >
                {index === 0 ? <Sticker src="/brand/sticker-flower-cream.svg" className="-right-7 -top-8 w-[100px]" /> : null}
                <StepNumber value={index + 1} />
                <h3 className="mb-1.5 mt-2.5 text-[24px] font-medium tracking-[-0.6px]">
                  <Link href={countryPath({ name: hub.countryName })} className="text-ink">
                    {hub.countryName}
                  </Link>
                </h3>
                <p className="text-small">
                  Billed in {hub.currency}
                  {hub.insuredCoverMinor > 0 ? ` · stock insured up to ${formatMoney(hub.insuredCoverMinor, hub.currency, localeFor(hub.countryCode))}` : " · insured stock"}
                </p>
              </NotebookNote>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function PartnerBand() {
  return (
    <section aria-labelledby="partner-band" className="pt-24 sm:pt-[120px]">
      <NotebookNote tone="yellow" tilt="none" className="flex flex-col items-start justify-between gap-5 px-8 py-8 md:flex-row md:items-center">
        <div>
          <Stamp className="text-cocoa">Fulfilment partners</Stamp>
          <h2 id="partner-band" className="mt-2 text-[30px] font-medium leading-[32px] tracking-[-1px]">
            Got space and a few hours a week?
          </h2>
          <p className="mt-2 max-w-[520px] text-small">Earn by receiving, storing and packing for our vendors where you live. No upfront cost.</p>
        </div>
        <ButtonLink href="/partners" variant="primary" size="lg">
          Become a fulfilment partner →
        </ButtonLink>
      </NotebookNote>
    </section>
  );
}

export function ClosingBand() {
  return (
    <div className="grain relative mx-2 mt-24 overflow-hidden rounded-band bg-lime px-4 py-20 text-center text-cocoa sm:mx-5 sm:mt-[120px] sm:py-[90px]">
      <Sticker src="/brand/sticker-flower-pink.svg" className="left-20 top-[60px] hidden w-[150px] -rotate-12 md:block" />
      <Sticker src="/brand/badge-scallop-sky.svg" className="right-[90px] top-[50px] hidden w-[170px] rotate-[10deg] md:block" />
      <Sticker src="/brand/sticker-clover.svg" className="bottom-10 left-[150px] hidden w-[130px] rotate-[8deg] md:block" />
      <Sticker src="/brand/sticker-flower-blue.svg" className="bottom-[30px] right-[170px] hidden w-[130px] md:block" />
      <h2 className="mx-auto max-w-[760px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">Make room for your next market.</h2>
      <p className="mb-[30px] mt-5 text-lead text-ink-soft">Start with one shipment. See where it takes you.</p>
      <ButtonLink href="/signup" variant="primary" size="lg">
        Create your account ↗
      </ButtonLink>
    </div>
  );
}
