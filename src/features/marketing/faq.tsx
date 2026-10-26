import { Stamp } from "@/components/ui/surfaces";

export interface FaqItem {
  question: string;
  answer: string;
}

export const VENDOR_FAQ: readonly FaqItem[] = [
  {
    question: "Who looks after my stock?",
    answer:
      "Vetted local fulfilment partners. Each one passes an identity check, proves their address, gives a referee we contact, shows us their storage space and signs our partner agreement before taking any stock.",
  },
  {
    question: "What if something goes missing or gets damaged?",
    answer: "Your stock is insured while it's at a hub, and we hold the cover, not the partner. Every arrival and every parcel is photographed, so there's evidence to settle a claim quickly.",
  },
  {
    question: "How do you keep hubs honest?",
    answer:
      "New partners can only hold low-value stock up to a low limit. We run surprise video stock counts and send test orders they can't tell apart from real ones. Part of every partner's pay is held back for two months, and a partner isn't paid for an order until it has a dispatch photo and tracking.",
  },
  {
    question: "Can I see where my stock is?",
    answer: "Yes. You see every box from the moment it's declared to the moment it's counted at the hub, and every order from packing to delivery, with tracking for each parcel.",
  },
  {
    question: "How fast do customers get their orders?",
    answer: "Orders are packed at the hub in the customer's country and handed to a local carrier, so most arrive in a few days rather than weeks.",
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
