import { ButtonLink } from "@/components/ui/button";
import { NotebookNote, Sticker } from "@/components/ui/surfaces";
import { cn } from "@/lib/cn";

const PEEK_NAV = [
  { label: "Overview", dot: "bg-orange", active: true },
  { label: "Inbound", dot: "bg-blue" },
  { label: "Inventory", dot: "bg-lime" },
  { label: "Orders", dot: "bg-pink" },
];

const PEEK_TILES = [
  { label: "Awaiting receipt", value: "03", note: "Expected this week", tone: "bg-sky" },
  { label: "Units in storage", value: "1,248", note: "In 2 countries", tone: "bg-lime" },
  { label: "Orders today", value: "27", note: "Packed by 4pm", tone: "bg-yellow" },
];

export function Hero() {
  return (
    <div className="relative mx-2 overflow-hidden rounded-band bg-sky pb-12 pt-12 sm:mx-5 sm:pt-[70px] md:pb-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[url(/brand/confetti-scatter.svg)] bg-[length:1400px_auto] bg-center [mask-image:linear-gradient(to_right,black_0,transparent_16%,transparent_84%,black_100%)] lg:block"
      />
      <div className="relative mx-auto max-w-container px-4 sm:px-8">
        <Sticker src="/brand/badge-scallop-orange.svg" className="right-16 top-[150px] hidden w-[170px] rotate-12 xl:block" />
        <h1 className="[--i:1] motion-rise max-w-[900px] text-[44px] font-medium leading-[46px] tracking-[-2px] md:text-[72px] md:leading-[72px] md:tracking-[-2.8px]">
          Get your products closer to your customers
        </h1>
        <p className="[--i:2] motion-rise my-7 max-w-[600px] text-[20px] leading-[30px] text-ink-soft">
          We store your stock in the country you sell to, then pack and deliver every order fast, so your customers get them in days, not weeks.
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
