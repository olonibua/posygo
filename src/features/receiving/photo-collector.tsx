"use client";

import { useRef, useState } from "react";

import { FileDrop } from "@/components/ui/file-drop";
import { type UploadPurpose, uploadPrivateFile } from "@/lib/api/uploads";

const PHOTOS = "image/jpeg,image/png,image/webp,image/heic";

interface PhotoCollectorProps {
  label: string;
  hint: string;
  max: number;
  error?: string;
  purpose?: UploadPurpose;
  accept?: string;
  onChange: (fileIds: string[]) => void;
}

export function PhotoCollector({ label, hint, max, error, purpose = "EVIDENCE_PHOTO", accept = PHOTOS, onChange }: PhotoCollectorProps) {
  const latest = useRef<Array<string | null>>([null]);
  const [slots, setSlots] = useState(latest.current);

  async function upload(index: number, file: File) {
    const fileId = await uploadPrivateFile(file, purpose);
    const next = latest.current.map((value, position) => (position === index ? fileId : value));
    latest.current = next.every(Boolean) && next.length < max ? [...next, null] : next;
    setSlots(latest.current);
    onChange(latest.current.filter((value): value is string => Boolean(value)));
  }

  return (
    <div className="flex flex-col gap-2.5">
      {slots.map((_, index) => (
        <FileDrop key={index} label={index === 0 ? label : `${label} ${index + 1}`} hint={hint} accept={accept} error={index === 0 ? error : undefined} onFile={(file) => upload(index, file)} />
      ))}
    </div>
  );
}
