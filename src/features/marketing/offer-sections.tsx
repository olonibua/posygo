import { ButtonLink } from "@/components/ui/button";
import { DotList, type DotListItem, FeatureCard } from "@/components/ui/feature-card";
import { PlanCard } from "@/components/ui/plan-card";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";

const ARRIVALS: readonly DotListItem[] = [
  { label: "Box 1 of 3 · Wigs", dot: "orange", status: "Counted", statusTone: "lime" },
  { label: "Box 2 of 3 · Extensions", dot: "blue", status: "Photographed", statusTone: "sky" },
  { label: "Box 3 of 3 · Accessories", dot: "magenta", status: "On the way", statusTone: "yellow" },
];

export function FeatureSection() {
  return (
    <section id="features" className="mt-24 rounded-band bg-sky px-6 py-12 sm:mt-[120px] md:px-16 md:py-[70px]">
      <Stamp className="text-cocoa">Under one roof</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">Every unit counted. Every order where it belongs.</h2>
      <div className="mt-[50px] grid gap-6 md:grid-cols-2">
        <FeatureCard
          title="See every box arrive"
          body="Each carton is counted and photographed when it reaches the hub, so you know exactly what you have before you sell it."
          footer={<DotList items={ARRIVALS} />}
        />
        <FeatureCard
          confetti
          title="Ship where your customers are"
          body="Every order says where it's going. Sell at home, or send it to any destination your market has opened."
          footer={
            <div className="flex justify-center">
              <NotebookNote className="w-full max-w-[330px]">
                <Stamp className="text-cocoa">Order 1042</Stamp>
                <p className="mt-2.5 text-[30px] font-medium leading-[31px] tracking-[-1px]">Manchester → New York</p>
              </NotebookNote>
            </div>
          }
        />
      </div>
    </section>
  );
}

export function AudienceSection() {
  return (
    <section id="who-its-for" className="pt-24 text-center sm:pt-[120px]">
      <Stamp>Who it’s for</Stamp>
      <h2 className="mx-auto mt-3.5 max-w-[820px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">One network, three ways in</h2>
      <div className="mt-[54px] grid gap-6 md:grid-cols-3">
        <PlanCard
          tone="yellow"
          title="Sellers"
          line="Start in the market you know."
          headline="1"
          headlineNote="market to start"
          action={<ButtonLink href="/signup">Start selling</ButtonLink>}
          points={[
            { text: "Verified once, in your own country", dot: "orange" },
            { text: "Stock counted and photographed on arrival", dot: "sky" },
            { text: "Fees in your local currency", dot: "pink" },
          ]}
        />
        <PlanCard
          tone="lime"
          title="Growing brands"
          line="Reach customers across borders."
          headline="Every"
          headlineNote="destination you open"
          sticker="/brand/badge-scallop-sky.svg"
          action={<ButtonLink href="/signup">Start selling</ButtonLink>}
          points={[
            { text: "Choose the countries you ship to", dot: "orange" },
            { text: "Customs paperwork prepared for each order", dot: "sky" },
            { text: "Invite your team to help", dot: "magenta" },
          ]}
        />
        <PlanCard
          tone="sky"
          title="Fulfilment partners"
          line="Run a hub where you live."
          headline="70%"
          headlineNote="of the hub fees"
          action={<ButtonLink href="/partners">Become a partner</ButtonLink>}
          points={[
            { text: "No upfront cost", dot: "orange" },
            { text: "Choose how much stock you take", dot: "lime" },
            { text: "We bring the vendors", dot: "pink" },
          ]}
        />
      </div>
    </section>
  );
}
