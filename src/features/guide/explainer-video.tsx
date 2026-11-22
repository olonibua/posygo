import type { ReactNode } from "react";

import { Paper, Stamp } from "@/components/ui/surfaces";

export interface ExplainerVideoSource {
  src: string;
  poster: string;
  label: string;
  stamp: string;
}

interface ExplainerVideoProps {
  video: ExplainerVideoSource;
  title: string;
  body: string;
  action?: ReactNode;
}

export function ExplainerVideo({ video, title, body, action }: ExplainerVideoProps) {
  return (
    <Paper className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
      <video className="aspect-video w-full rounded-card bg-paper-sunk" controls playsInline preload="none" poster={video.poster} aria-label={video.label}>
        <source src={video.src} type="video/mp4" />
      </video>
      <div className="flex flex-col gap-1.5 px-1 lg:px-2">
        <Stamp>{video.stamp}</Stamp>
        <h2 className="text-[22px] font-medium tracking-[-0.5px]">{title}</h2>
        <p className="text-small text-ink-soft">{body}</p>
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </Paper>
  );
}
