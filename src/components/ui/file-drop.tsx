"use client";

import { type ChangeEvent, type DragEvent, useId, useState } from "react";

import { cn } from "@/lib/cn";

import { StatusPill } from "./chip";

export type UploadState = "EMPTY" | "UPLOADING" | "VERIFIED" | "REJECTED";

const STATE_DISPLAY: Record<Exclude<UploadState, "EMPTY">, { label: string; tone: "sky" | "lime" | "pink" }> = {
  UPLOADING: { label: "Checking…", tone: "sky" },
  VERIFIED: { label: "Uploaded", tone: "lime" },
  REJECTED: { label: "Rejected", tone: "pink" },
};

interface FileDropProps {
  label: string;
  hint: string;
  accept: string;
  initialState?: UploadState;
  error?: string;
  disabled?: boolean;
  onFile: (file: File) => Promise<void>;
}

export function FileDrop({ label, hint, accept, initialState = "EMPTY", error, disabled, onFile }: FileDropProps) {
  const id = useId();
  const [state, setState] = useState<UploadState>(initialState);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      void upload(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled && state !== "UPLOADING") {
      void upload(file);
    }
  }

  async function upload(file: File) {
    setState("UPLOADING");
    setMessage(null);
    try {
      await onFile(file);
      setState("VERIFIED");
    } catch (caught) {
      setState("REJECTED");
      setMessage(caught instanceof Error ? caught.message : "Upload failed. Try again.");
    }
  }

  const shownError = message ?? error;
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative overflow-hidden rounded-tile border-[1.5px] border-dashed px-5 py-4 transition-[background-color,border-color,scale] duration-200",
        shownError ? "border-danger bg-paper" : dragging ? "scale-[1.01] border-ink bg-sky/30" : state === "VERIFIED" ? "border-lime bg-lime/20" : "border-line-strong bg-paper",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-medium">{label}</p>
          <p className="text-meta font-normal text-ink-faint">{dragging ? "Drop it here" : hint}</p>
        </div>
        <div className="flex items-center gap-3">
          {state === "EMPTY" ? null : (
            <span key={state} className="motion-pop">
              <StatusPill tone={STATE_DISPLAY[state].tone}>{STATE_DISPLAY[state].label}</StatusPill>
            </span>
          )}
          <label
            htmlFor={id}
            className={cn(
              "motion-press cursor-pointer rounded-chip px-[18px] py-3 text-small font-medium shadow-[inset_0_0_0_1.5px_var(--ink)] hover:bg-paper-sunk active:scale-95",
              disabled && "pointer-events-none opacity-60",
            )}
          >
            {state === "VERIFIED" ? "Replace" : "Choose file"}
          </label>
          <input id={id} type="file" accept={accept} className="sr-only" disabled={disabled || state === "UPLOADING"} onChange={(event) => void handleChange(event)} />
        </div>
      </div>
      {state === "UPLOADING" ? (
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-sky/40">
          <span className="block h-full w-1/3 animate-[upload-slide_1.1s_var(--ease-out)_infinite] rounded-full bg-blue" />
        </span>
      ) : null}
      {shownError ? (
        <p role="alert" className="motion-rise mt-2 text-meta text-danger">
          {shownError}
        </p>
      ) : null}
    </div>
  );
}
