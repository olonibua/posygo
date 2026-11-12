type PixelCommand = (...args: unknown[]) => void;
type PixelQueue = PixelCommand & { callMethod?: PixelCommand; queue: unknown[][]; loaded: boolean; version: string; push: PixelCommand };

declare global {
  interface Window {
    fbq?: PixelQueue;
    _fbq?: PixelQueue;
  }
}

export type PixelEvent = "PageView" | "ViewContent" | "Lead" | "CompleteRegistration" | "Contact";

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

export function loadMetaPixel(pixelId: string = META_PIXEL_ID): void {
  if (!pixelId || typeof window === "undefined" || window.fbq) return;
  const queue = function (...args: unknown[]) {
    if (queue.callMethod) queue.callMethod(...args);
    else queue.queue.push(args);
  } as PixelQueue;
  queue.push = queue;
  queue.loaded = true;
  queue.version = "2.0";
  queue.queue = [];
  window.fbq = queue;
  window._fbq = queue;
  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_URL;
  document.head.appendChild(script);
  queue("init", pixelId);
}

export function trackPixel(event: PixelEvent, details?: Record<string, string | number>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, details);
}
