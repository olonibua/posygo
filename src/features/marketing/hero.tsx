import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { NotebookNote, Sticker } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";

import { listNames } from "./live-countries";

const SHORT_NAMES: Record<string, string> = { "United Kingdom": "the UK", "United States": "the US" };

function shortName(name: string): string {
  return SHORT_NAMES[name] ?? name;
}

const PEEK_NAV = [
  { label: "Overview", dot: "bg-orange", active: true },
  { label: "Inbound", dot: "bg-blue" },
  { label: "Inventory", dot: "bg-lime" },
  { label: "Orders", dot: "bg-pink" },
];

const PEEK_TILES = [
  { label: "Awaiting receipt", value: "03", note: "Expected this week", tone: "bg-sky" },
  { label: "Units in storage", value: "1,248", note: "Across 2 hubs", tone: "bg-lime" },
  { label: "Orders today", value: "27", note: "Packed by 4pm", tone: "bg-yellow" },
];

export function Hero({ hubCountries }: { hubCountries: readonly string[] }) {
  const where = hubCountries.length > 0 ? `in ${listNames(hubCountries.map(shortName))}` : "close to your customers";
  return (
    <div className="grain relative mx-2 overflow-hidden rounded-band bg-cream bg-[url(/brand/confetti-scatter.svg)] bg-[length:1400px_auto] bg-center pt-12 sm:mx-5 sm:pt-[70px]">
      <div className="mx-auto max-w-container px-4 sm:px-8">
        <Sticker src="/brand/badge-scallop-orange.svg" className="right-14 top-[300px] hidden w-[170px] rotate-12 lg:block" />
        <Chip tone="yellow" className="motion-pop">
          {hubCountries.length > 0 ? `${hubCountries.length} ${hubCountries.length === 1 ? "country" : "countries"} with live hubs` : "Fulfilment hubs opening soon"}
        </Chip>
        <h1 className="[--i:1] motion-rise mt-[26px] max-w-[1000px] text-[44px] font-medium leading-[46px] tracking-[-2px] md:text-[64px] md:leading-[64px] md:tracking-[-2.6px]">
          Store your stock {where}, and deliver to customers in days.
        </h1>
        <p className="[--i:2] motion-rise my-7 max-w-[560px] text-[20px] leading-[30px] text-ink-soft">
          Send inventory to a local fulfilment hub in the country you sell to. Every unit is counted, every order is photographed and tracked, and your stock is insured while it&apos;s with us.
        </p>
        <div className="[--i:3] motion-rise flex flex-wrap items-center gap-3">
          <ButtonLink href="/signup" variant="yellow" size="lg">
            Start selling →
          </ButtonLink>
          <ButtonLink href="/#how-it-works" variant="ghost" size="lg">
            See how it works
          </ButtonLink>
        </div>
      </div>
      <ProductPeek />
    </div>
  );
}

function ProductPeek() {
  return (
    <div
      aria-hidden
      className="[--i:5] motion-rise relative mx-auto mt-[70px] hidden h-[430px] w-[1000px] max-w-[calc(100%-32px)] grid-cols-[200px_1fr] overflow-hidden rounded-t-[22px] bg-paper shadow-peek md:grid"
    >
      <div className="bg-paper-sunk px-[18px] py-[22px]">
        <span className="flex items-center gap-1.5 text-[19px] font-semibold tracking-[-0.6px]">
          <img src="/brand/flower-mark.svg" alt="" className="h-[22px] w-[22px]" />
          Portal
        </span>
        {PEEK_NAV.map((item) => (
          <div key={item.label} className={cn("mt-1.5 flex items-center gap-2.5 rounded-control p-2.5 text-[13px]", item.active && "bg-paper")}>
            <i className={cn("h-2.5 w-2.5 rounded-full", item.dot)} />
            {item.label}
          </div>
        ))}
      </div>
      <div className="px-7 py-[26px]">
        <span className="text-stamp uppercase text-ink-faint">Good morning, Amara</span>
        <p className="mb-[18px] mt-1.5 text-[28px] font-medium tracking-[-1px]">Everything is where it should be.</p>
        <div className="grid grid-cols-3 gap-3">
          {PEEK_TILES.map((tile) => (
            <div key={tile.label} className={cn("rounded-card p-3.5 text-cocoa", tile.tone)}>
              {tile.label}
              <b className="mt-1.5 block text-[34px] font-medium tracking-[-1px]">{tile.value}</b>
              <span className="text-meta font-normal">{tile.note}</span>
            </div>
          ))}
        </div>
      </div>
      <NotebookNote tone="sky" className="absolute -bottom-3.5 right-10 w-[290px] text-small">
        <span className="block text-label uppercase text-cocoa">Next up</span>
        <span className="mt-1.5 block text-[20px] font-medium tracking-[-0.5px]">3 boxes arrive Tuesday</span>
      </NotebookNote>
    </div>
  );
}
