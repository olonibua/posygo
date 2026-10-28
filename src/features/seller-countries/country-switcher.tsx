"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CheckMark } from "@/components/ui/check-mark";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

import { countryFlag } from "./country-flag";
import { ALL_COUNTRIES, useSelectedCountry } from "./selected-country";

const OVERVIEW = "/overview";

interface Option {
  code: string;
  label: string;
  detail: string;
}

export function CountrySwitcher() {
  const { countries, country, allCountries, select } = useSelectedCountry();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const offersAll = pathname === OVERVIEW;
  const showingAll = offersAll && allCountries;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => !panel.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  if (!country) {
    return null;
  }

  const options: Option[] = [
    ...(offersAll ? [{ code: ALL_COUNTRIES, label: "All countries", detail: `${countries.length}` }] : []),
    ...countries.map((entry) => ({ code: entry.code, label: `${countryFlag(entry.code)} ${entry.name}`, detail: entry.currency })),
  ];
  const current = showingAll ? ALL_COUNTRIES : country.code;

  function choose(code: string) {
    select(code);
    setOpen(false);
  }

  return (
    <div ref={panel} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Country: ${showingAll ? "all countries" : country.name}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "motion-press flex h-11 min-w-0 max-w-[260px] items-center gap-2 rounded-nav border-[1.5px] bg-paper px-3.5 text-small font-medium hover:border-ink",
          open ? "border-ink" : "border-line-strong",
        )}
      >
        {showingAll ? (
          <span className="truncate">
            All<span className="hidden sm:inline"> countries</span>
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-1.5">
            <span aria-hidden>{countryFlag(country.code)}</span>
            <span className="hidden truncate sm:inline">{country.name} ·</span>
            <span>{country.currency}</span>
          </span>
        )}
        <Icon name="chevronDown" className={cn("h-4 w-4 shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Choose a country"
          className="absolute right-0 top-[52px] z-40 w-[280px] max-w-[calc(100vw-32px)] origin-top-right rounded-card border border-line bg-paper py-1.5 shadow-frame [animation:popover-in_var(--dur)_var(--ease-out)_both]"
        >
          {options.map((option) => {
            const selected = option.code === current;
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choose(option.code)}
                className={cn("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-small hover:bg-ground", selected && "font-medium")}
              >
                <span className="truncate">{option.label}</span>
                <span className="flex shrink-0 items-center gap-2 text-meta text-ink-faint">
                  {option.detail}
                  {selected ? <CheckMark className="h-3.5 w-3.5 text-ink" /> : <span className="w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
