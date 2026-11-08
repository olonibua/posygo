import { Paper, Stamp } from "@/components/ui/surfaces";

const VIDEO = { src: "/videos/how-posygo-works.mp4", poster: "/videos/how-posygo-works.jpg" };

interface HowItWorksVideoProps {
  title: string;
  body: string;
}

export function HowItWorksVideo({ title, body }: HowItWorksVideoProps) {
  return (
    <Paper className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
      <video className="aspect-video w-full rounded-card bg-paper-sunk" controls playsInline preload="none" poster={VIDEO.poster} aria-label="How to use Posygo, a two-minute video">
        <source src={VIDEO.src} type="video/mp4" />
      </video>
      <div className="flex flex-col gap-1.5 px-1 lg:px-2">
        <Stamp>How to use Posygo · 2 min</Stamp>
        <h2 className="text-[22px] font-medium tracking-[-0.5px]">{title}</h2>
        <p className="text-small text-ink-soft">{body}</p>
      </div>
    </Paper>
  );
}
