import { Stamp } from "@/components/ui/surfaces";

export function GettingStarted() {
  const steps = [
    "Create your account and confirm your email.",
    "Add your business details.",
    "Check your ID with a quick selfie, so we know every seller is real.",
    "Sign the seller agreement and your account goes live.",
  ];
  return (
    <section id="getting-started" className="pt-24 sm:pt-[120px]">
      <Stamp>Before your first order</Stamp>
      <h2 className="mt-3.5 max-w-[820px] text-[40px] font-medium leading-[42px] tracking-[-1.6px] md:text-[52px] md:leading-[54px] md:tracking-[-2px]">What happens when you sign up.</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="motion-rise rounded-tile bg-sky px-6 py-7 text-cocoa sm:px-8">
          <span className="block text-stamp uppercase text-cocoa/70">Before you go live</span>
          <ol className="mt-4 flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-[16px] leading-[23px]">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-cocoa text-meta font-medium text-on-ink">{index + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="motion-rise rounded-tile bg-lime px-6 py-7 text-cocoa sm:px-8">
          <span className="block text-stamp uppercase text-cocoa/70">Getting your stock to us</span>
          <p className="mt-4 text-[16px] leading-[24px]">
            Send one bulk shipment to your hub with any freight forwarder or cargo service you trust. You book and pay for that shipment, and its cost is shared across every item inside, so it works
            out far cheaper per item than posting orders one by one.
          </p>
          <p className="mt-3 text-[16px] leading-[24px]">
            Tell us what&apos;s coming before you send it. We count and photograph every box when it arrives, so you see exactly what you have before you sell it.
          </p>
        </div>
      </div>
    </section>
  );
}
