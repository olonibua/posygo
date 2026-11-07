import { cn } from "@/lib/cn";

const EVENTS = [
  { text: "Order ORD-GB-4821 packed and photographed", place: "Manchester", tone: "bg-yellow" },
  { text: "40 units of shea butter put on the shelf", place: "Manchester", tone: "bg-lime" },
  { text: "Order ORD-CA-1307 out for delivery", place: "Toronto", tone: "bg-sky" },
  { text: "Box IN-GB-2210 received and counted", place: "Manchester", tone: "bg-pink" },
  { text: "Order ORD-GB-4817 delivered", place: "Leeds", tone: "bg-lime" },
  { text: "Order ORD-CA-1309 packed and photographed", place: "Toronto", tone: "bg-yellow" },
];

export function PeekFeed() {
  return (
    <div className="mt-5 w-[calc(100%-320px)]">
      <span className="flex items-center gap-2 text-stamp uppercase text-ink-faint">
        <i className="peek-live h-2 w-2 rounded-full bg-lime" />
        Happening now
      </span>
      <div className="mt-2 h-[150px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
        <ul className="peek-feed">
          {[...EVENTS, ...EVENTS].map((event, index) => (
            <li key={index} className="mb-2 flex items-center gap-2.5 rounded-control border border-line bg-paper px-3 py-2 text-[13px]">
              <i className={cn("h-2.5 w-2.5 shrink-0 rounded-full", event.tone)} />
              <span className="min-w-0 flex-1 truncate">{event.text}</span>
              <span className="shrink-0 text-meta text-ink-faint">{event.place}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
