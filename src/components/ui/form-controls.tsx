"use client";

import { type ComponentProps, type ReactNode, useId, useState } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";

const CONTROL =
  "h-12 w-full rounded-card border-[1.5px] border-line-strong bg-paper px-3.5 text-base text-ink outline-none sm:text-[15px] transition-[border-color,box-shadow] duration-200 placeholder:text-ink-faint hover:border-ink-faint focus:border-ink focus:shadow-[0_0_0_4px_var(--yellow)] aria-[invalid=true]:border-danger";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (control: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 text-small font-medium text-ink">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-meta font-normal text-ink-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="motion-rise mt-1.5 text-meta text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(CONTROL, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(CONTROL, "h-auto min-h-[120px] py-3 leading-[22px]", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(CONTROL, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <Icon name="chevronDown" className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
    </div>
  );
}

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className="pr-20" {...props} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-chip px-2.5 py-1.5 text-meta text-ink-soft hover:bg-paper-sunk"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export function CodeInput({ length, className, ...props }: Omit<ComponentProps<"input">, "type" | "inputMode"> & { length: number }) {
  return (
    <Input
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern={`\\d{${length}}`}
      maxLength={length}
      className={cn("text-center font-mono text-[22px] tracking-[0.4em]", className)}
      {...props}
    />
  );
}

export function Checkbox({ label, error, className, ...props }: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-small text-ink-soft">
        <span className="relative mt-0.5 grid h-5 w-5 shrink-0">
          <input id={id} type="checkbox" className="peer absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0" aria-invalid={Boolean(error)} {...props} />
          <span
            aria-hidden
            className="motion-press check-box pointer-events-none grid place-items-center rounded-[6px] border-[1.5px] border-line-strong bg-paper text-transparent peer-checked:border-cocoa peer-checked:bg-cocoa peer-checked:text-on-ink peer-hover:border-ink peer-focus-visible:shadow-[0_0_0_4px_var(--yellow)] peer-active:scale-90 peer-aria-[invalid=true]:border-danger"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8.5 6.5 12 13 4.5" strokeDasharray={16} />
            </svg>
          </span>
        </span>
        <span>{label}</span>
      </label>
      {error ? (
        <p role="alert" className="motion-rise mt-1.5 text-meta text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span aria-hidden className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-200", checked ? "border-cocoa" : "border-line-strong bg-paper")}>
      <span className={cn("h-2.5 w-2.5 rounded-full bg-cocoa transition-[scale] duration-300 ease-[var(--ease-spring)]", checked ? "scale-100" : "scale-0")} />
    </span>
  );
}

export function FormAlert({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }
  return (
    <div role="alert" className="motion-rise rounded-card border border-pink bg-pink/40 px-4 py-3 text-small text-cocoa">
      {message}
    </div>
  );
}
