import { ExplainerVideo } from "./explainer-video";

const VIDEO = { src: "/videos/how-posygo-works.mp4", poster: "/videos/how-posygo-works.jpg", label: "How to use Posygo, a two-minute video", stamp: "How to use Posygo · 2 min" };

export function HowItWorksVideo({ title, body }: { title: string; body: string }) {
  return <ExplainerVideo video={VIDEO} title={title} body={body} />;
}
