"use client";

import { type RefObject, useEffect, useLayoutEffect, useState } from "react";

const DESKTOP = "(min-width: 768px)";
const KEYBOARD_SHARE = 0.8;
const GAP = 8;
const MIN_HEIGHT = 200;

function fit(element: HTMLElement, viewport: VisualViewport, desktop: boolean): void {
  if (desktop) {
    element.style.height = "";
    return;
  }
  const visibleBottom = viewport.offsetTop + viewport.height;
  const top = element.getBoundingClientRect().top;
  element.style.height = `${Math.max(MIN_HEIGHT, Math.round(visibleBottom - top - GAP))}px`;
}

export function useFitToScreen(target: RefObject<HTMLElement | null>): { keyboardOpen: boolean } {
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    const element = target.current;
    if (!viewport || !element) {
      return;
    }
    const desktop = window.matchMedia(DESKTOP);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setKeyboardOpen(!desktop.matches && viewport.height < window.innerHeight * KEYBOARD_SHARE);
        fit(element, viewport, desktop.matches);
      });
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    desktop.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      desktop.removeEventListener("change", update);
      element.style.height = "";
    };
  }, [target]);

  useLayoutEffect(() => {
    const viewport = window.visualViewport;
    const element = target.current;
    if (viewport && element) {
      if (keyboardOpen) {
        window.scrollTo({ top: 0 });
      }
      fit(element, viewport, window.matchMedia(DESKTOP).matches);
    }
  }, [target, keyboardOpen]);

  return { keyboardOpen };
}
