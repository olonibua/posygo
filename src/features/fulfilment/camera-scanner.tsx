"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

type CameraState = "starting" | "ready" | "blocked" | "unavailable";

const STATE_NOTES: Record<Exclude<CameraState, "ready">, string> = {
  starting: "Starting the camera…",
  blocked: "Camera access is off. Allow the camera for this site in your browser settings, then try again.",
  unavailable: "No camera was found on this device.",
};

interface CameraScannerProps {
  onCode: (code: string) => void;
  onClose: () => void;
}

export function CameraScanner({ onCode, onClose }: CameraScannerProps) {
  const video = useRef<HTMLVideoElement>(null);
  const handler = useRef(onCode);
  const [state, setState] = useState<CameraState>("starting");
  handler.current = onCode;

  useEffect(() => {
    let stop: (() => void) | null = null;
    let cancelled = false;
    let found = false;
    void (async () => {
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([import("@zxing/browser"), import("@zxing/library")]);
      const hints = new Map([
        [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.QR_CODE]],
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      if (cancelled || !video.current) {
        return;
      }
      try {
        const controls = await reader.decodeFromConstraints({ video: { facingMode: "environment" } }, video.current, (result) => {
          const code = result?.getText().trim();
          if (code && !found) {
            found = true;
            navigator.vibrate?.(60);
            handler.current(code);
          }
        });
        stop = () => controls.stop();
        if (cancelled) {
          stop();
        } else {
          setState("ready");
        }
      } catch (error) {
        setState(error instanceof DOMException && error.name === "NotAllowedError" ? "blocked" : "unavailable");
      }
    })();
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Scan with the camera" className="fixed inset-0 z-[70] flex flex-col bg-[#0b0b0b] text-white">
      <div className="relative flex-1 overflow-hidden">
        <video ref={video} muted playsInline className="h-full w-full object-cover" />
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-[34%] w-[78%] max-w-[420px] rounded-[18px] border-[3px] border-yellow shadow-[0_0_0_100vmax_rgba(0,0,0,0.45)]" />
        </div>
        {state === "ready" ? null : <p className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center text-body">{STATE_NOTES[state]}</p>}
      </div>
      <div className="flex flex-col gap-3 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <p className="text-center text-small text-white/85">Point the camera at the barcode or the lot label. The code goes in the box for you to check.</p>
        <Button variant="yellow" size="lg" className="w-full justify-center" onClick={onClose}>
          Close camera
        </Button>
      </div>
    </div>,
    document.body,
  );
}
