"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { recordOpenedPage, startTrailRecorder } from "./signals/trail-recorder";

const Helper = dynamic(() => import("./helper").then((loaded) => loaded.Helper), { ssr: false });

const FIRST_SIGNS_OF_USE = ["pointerdown", "keydown", "focusin", "scroll"] as const;
const LOAD_ANYWAY_MS = 6_000;
const TITLE_SETTLE_MS = 100;

export function DeferredHelper() {
  const [wanted, setWanted] = useState(false);
  const pathname = usePathname();

  useEffect(startTrailRecorder, []);

  useEffect(() => {
    const timer = window.setTimeout(recordOpenedPage, TITLE_SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const load = () => setWanted(true);
    FIRST_SIGNS_OF_USE.forEach((event) => window.addEventListener(event, load, { once: true, passive: true }));
    const timer = window.setTimeout(load, LOAD_ANYWAY_MS);
    return () => {
      FIRST_SIGNS_OF_USE.forEach((event) => window.removeEventListener(event, load));
      window.clearTimeout(timer);
    };
  }, []);

  return wanted ? <Helper /> : null;
}
