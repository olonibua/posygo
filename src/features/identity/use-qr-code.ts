"use client";

import { toDataURL } from "qrcode";
import { useEffect, useState } from "react";

export function useQrCode(text: string | null): string | null {
  const [image, setImage] = useState<{ text: string; dataUrl: string } | null>(null);
  useEffect(() => {
    if (!text) {
      return;
    }
    let current = true;
    void toDataURL(text, { margin: 1, width: 440, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } }).then((dataUrl) => {
      if (current) {
        setImage({ text, dataUrl });
      }
    });
    return () => {
      current = false;
    };
  }, [text]);
  return image && image.text === text ? image.dataUrl : null;
}
