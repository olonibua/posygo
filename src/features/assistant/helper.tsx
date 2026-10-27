"use client";

import { HelperLauncher } from "./helper-launcher";
import { HelperPanel } from "./helper-panel";
import { useAssistant } from "./use-assistant";

export function Helper() {
  const helper = useAssistant();
  return (
    <>
      <HelperLauncher helper={helper} />
      <HelperPanel helper={helper} />
    </>
  );
}
