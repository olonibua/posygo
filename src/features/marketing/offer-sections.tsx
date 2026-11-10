import { DotList, type DotListItem, FeatureCard } from "@/components/ui/feature-card";
import { NotebookNote, Stamp } from "@/components/ui/surfaces";

const ARRIVALS: readonly DotListItem[] = [
  { label: "Box 1 of 3 · Wigs", dot: "orange", status: "Counted", statusTone: "lime" },
  { label: "Box 2 of 3 · Extensions", dot: "blue", status: "Photographed", statusTone: "sky" },
  { label: "Box 3 of 3 · Accessories", dot: "magenta", status: "On the way", statusTone: "yellow" },
];

export function FeatureSection() {
  return (
    <section id="features" className="mt-24 rounded-band bg-yellow px-6 py-12 sm:mt-[120px] md:px-16 md:py-[70px]">
      <Stamp className="text-cocoa">Under one roof</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[44px] font-medium leading-[46px] tracking-[-1.8px] md:text-display">Every unit counted. Every order where it belongs.</h2>
      <div className="mt-[50px] grid gap-6 md:grid-cols-2">
        <FeatureCard
          title="See every box arrive"
          body="Each carton is counted and photographed when it arrives, so you know exactly what you have before you sell it."
          footer={<DotList items={ARRIVALS} />}
        />
        <FeatureCard
          confetti
          title="Sent from the same country"
          body="Your stock waits in every country you sell in. Each order goes out from stock in that country, so it arrives fast."
          footer={
            <div className="flex justify-center">
              <NotebookNote className="w-full max-w-[330px]">
                <Stamp className="text-cocoa">Order 1042</Stamp>
                <p className="mt-2.5 text-[30px] font-medium leading-[31px] tracking-[-1px]">Leeds → Manchester</p>
              </NotebookNote>
            </div>
          }
        />
      </div>
    </section>
  );
}
