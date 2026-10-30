import type { PartnerProgrammeView } from "@/shared";

import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { NotebookNote, Paper, Stamp, StepNumber, Sticker } from "@/components/ui/surfaces";
import type { Tone } from "@/components/ui/tone";
import { percent } from "@/features/partners/partner-display";
import { formatMoney, localeFor } from "@/lib/format";

import type { FaqItem } from "./faq";

const BENEFITS: ReadonlyArray<{ title: string; body: string; tone: Tone }> = [
  { title: "No upfront cost", body: "No fees to join and nothing to buy. Shelving helps, but a clean, dry, lockable room is enough to start.", tone: "yellow" },
  { title: "Flexible", body: "Fit it around your week. Receive deliveries and pack orders when they come in, from your own space.", tone: "lime" },
  { title: "You choose how much", body: "Start small. You can take more stock as you build a record with us.", tone: "sky" },
  { title: "We bring the vendors", body: "You don't need to find customers. Vendors who sell in your country send their stock to you.", tone: "pink" },
  { title: "Paid for every task", body: "You earn a share of every box received, every month of storage and every order packed.", tone: "orange" },
];

const VERIFICATION = [
  "Apply with a referee from your community",
  "Quick photo ID and selfie check with our identity partner",
  "Proof of address from the last 3 months",
  "Photos or a short video of the space, and maybe a video call",
  "Set up payouts through our payment provider and confirm your tax status",
  "Sign the partner agreement online",
  "We approve you and you start on the starter tier",
] as const;

export const PARTNER_FAQ: readonly FaqItem[] = [
  {
    question: "Do I need a business?",
    answer: "No. Most partners are individuals who work as self-employed. You confirm you can legally do the work and give a tax reference where your country needs one.",
  },
  { question: "What happens if stock is damaged or lost?", answer: "Stock is protected by our claims process. Every arrival and every parcel is photographed, and part of your pay is held back for a while in case of claims, then released to you." },
  { question: "How do I get paid?", answer: "Earnings build up in your account as you work. We pay out to your bank through our payment provider. We never see or store your account number." },
  {
    question: "What do you keep about me?",
    answer: "Only what we need. Your ID check is done by our identity partner and we never receive the document. Proof of address is deleted after our decision.",
  },
  { question: "Can I stop?", answer: "Yes. Tell us and we'll move the stock out before the partnership ends." },
];

export function PartnerHero() {
  return (
    <div className="grain relative mx-2 overflow-hidden rounded-band bg-lime bg-[url(/brand/confetti-scatter.svg)] bg-[length:1400px_auto] bg-center px-4 py-14 sm:mx-5 sm:px-8 sm:py-[70px]">
      <div className="mx-auto max-w-container">
        <Sticker src="/brand/badge-scallop-sky.svg" className="right-14 top-12 hidden w-[160px] rotate-12 lg:block" />
        <Chip tone="lime">Fulfilment partners</Chip>
        <h1 className="[--i:1] motion-rise mt-[26px] max-w-[900px] text-[44px] font-medium leading-[46px] tracking-[-2px] md:text-[68px] md:leading-[68px] md:tracking-[-2.6px]">
          Earn money from your spare room.
        </h1>
        <p className="[--i:2] motion-rise my-7 max-w-[560px] text-[20px] leading-[30px] text-ink-soft">
          Become a host for our vendors. Store their stock, pack their orders, and get paid for every task. No upfront cost.
        </p>
        <ButtonLink href="#apply" variant="yellow" size="lg">
          Apply now →
        </ButtonLink>
      </div>
    </div>
  );
}

export function PartnerBenefits() {
  return (
    <section className="pt-20 sm:pt-[100px]">
      <Stamp>Why partners join</Stamp>
      <div className="stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {BENEFITS.map((benefit) => (
          <div key={benefit.title} className="motion-rise motion-lift rounded-card bg-paper px-5 py-5 shadow-[inset_0_0_0_1.5px_var(--line)]">
            <Chip tone={benefit.tone}>{benefit.title}</Chip>
            <p className="mt-3 text-small text-ink-soft">{benefit.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function EarningsExamples({ programmes }: { programmes: readonly PartnerProgrammeView[] }) {
  if (programmes.length === 0) {
    return null;
  }
  return (
    <section id="earnings" className="grain relative mt-20 overflow-hidden rounded-band bg-cocoa px-6 py-12 text-on-ink sm:mt-[100px] md:px-16 md:py-[70px]">
      <Sticker src="/brand/badge-scallop-sky.svg" className="-right-6 -top-6 hidden w-[140px] rotate-[10deg] md:block" />
      <Stamp className="text-on-ink-soft">What you could earn</Stamp>
      <h2 className="relative mt-3.5 max-w-[820px] text-[40px] font-medium leading-[42px] tracking-[-1.6px] text-on-ink md:text-[52px] md:leading-[54px]">
        You keep most of what vendors pay for the work.
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {programmes.map((programme) => {
          const money = (amount: number) => formatMoney(amount, programme.currency, localeFor(programme.countryCode));
          return (
            <Paper key={programme.countryCode} className="motion-rise motion-lift relative flex flex-col gap-3 px-6 py-6 text-ink">
              <p className="text-body font-semibold">{programme.countryName}</p>
              <p className="text-[36px] font-medium tracking-[-1.2px]">
                {money(programme.example.monthlyMinor)}
                <span className="text-small font-normal text-ink-soft"> a month</span>
              </p>
              <p className="text-small text-ink-soft">
                Example: receiving {programme.example.boxesReceived} boxes, storing {programme.example.boxesStored} and packing {programme.example.ordersPacked} orders in a month.
              </p>
              <ul className="text-small">
                <li>{percent(programme.receivingShareBps)} of receiving fees</li>
                <li>{percent(programme.storageShareBps)} of storage fees</li>
                <li>{percent(programme.fulfilmentShareBps)} of pick-and-pack fees</li>
                <li className="text-ink-soft">Postage and packaging are passed to vendors at cost</li>
              </ul>
              <p className="text-meta text-ink-faint">
                {percent(programme.holdbackBps)} of each earning is held for {programme.holdbackDays} days to cover claims, then paid to you.
              </p>
              {programme.foundingPlacesLeft > 0 && programme.foundingBonusBps > 0 ? (
                <NotebookNote tone="yellow" tilt="none" className="py-3 pl-[38px] pr-4 text-small">
                  Founding partner offer: the first partners here earn an extra {percent(programme.foundingBonusBps)}. {programme.foundingPlacesLeft}{" "}
                  {programme.foundingPlacesLeft === 1 ? "place" : "places"} left.
                </NotebookNote>
              ) : null}
            </Paper>
          );
        })}
      </div>
    </section>
  );
}

export function VerificationSteps() {
  return (
    <section className="mt-20 rounded-band bg-sky px-6 py-12 sm:mt-[100px] md:px-16 md:py-[70px]">
      <Stamp className="text-cocoa">How joining works</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-[52px] md:leading-[54px]">A few checks, all online.</h2>
      <p className="mt-4 max-w-[640px] text-[17px] leading-[26px] text-ink-soft">
        Vendors trust us with their stock, so we check every partner. New partners start with low-value items and a stock limit that rises as they build a good record.
      </p>
      <ol className="stagger mt-8 grid gap-3 md:grid-cols-2">
        {VERIFICATION.map((step, index) => (
          <li key={step} className="motion-rise flex items-center gap-4 rounded-card bg-paper px-5 py-4 text-small shadow-note">
            <StepNumber value={index + 1} />
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
