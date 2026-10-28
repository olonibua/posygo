import { Stamp } from "@/components/ui/surfaces";

export interface FaqItem {
  question: string;
  answer: string;
}

export const VENDOR_FAQ: readonly FaqItem[] = [
  {
    question: "How fast do my customers get their orders?",
    answer: "Your stock is already in their country, so we pack orders quickly and send them with tracking. Most arrive in a few days rather than weeks.",
  },
  {
    question: "How do I know my stock is safe?",
    answer: "Every unit is counted when it arrives, we run surprise stock counts, and every parcel is photographed before it goes. You can see all of it in your dashboard at any time.",
  },
  {
    question: "What if something goes missing or gets damaged?",
    answer: "Your stock is insured the whole time we hold it. Every arrival and every parcel is photographed, so there's evidence to settle a claim quickly.",
  },
  {
    question: "Can I see where my stock is?",
    answer: "Yes. You see every box from the moment it's sent to the moment it's counted, and every order from packing to delivery, with tracking for each parcel.",
  },
  {
    question: "Which countries can I sell to?",
    answer: "Our countries page lists where we store stock today. Pick the ones your customers are in, and add more whenever you're ready.",
  },
];

export function FaqSection({ items, heading = "Questions vendors ask" }: { items: readonly FaqItem[]; heading?: string }) {
  return (
    <section id="faq" className="pt-24 sm:pt-[120px]">
      <Stamp>FAQ</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-[52px] md:leading-[54px]">{heading}</h2>
      <div className="mt-10 flex max-w-[860px] flex-col divide-y divide-line">
        {items.map((item) => (
          <details key={item.question} className="faq group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[20px] font-medium tracking-[-0.4px]">
              {item.question}
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper-sunk text-ink transition-[rotate,background-color] duration-300 ease-[var(--ease-spring)] group-open:[rotate:45deg] group-open:bg-yellow"
              >
                +
              </span>
            </summary>
            <p className="mt-3 max-w-[720px] text-[16px] leading-[25px] text-ink-soft">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
