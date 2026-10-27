"use client";

import type { SessionUser } from "@/shared";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icon";
import { NotebookNote } from "@/components/ui/surfaces";
import { toneSurface } from "@/components/ui/tone";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

import { activeItem, type Console, type NavItem, visibleItems } from "./navigation";

const ITEM = "motion-press relative z-[1] flex items-center gap-3 rounded-nav px-2.5 py-[7px] text-[15px] no-underline";

export function Sidebar({ console, user, onNavigate }: { console: Console; user: SessionUser; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = visibleItems(console, user);
  const current = activeItem(items, pathname);
  const groups = [...new Set(items.map((item) => item.group))];
  const nav = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const active = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    setPill(active ? { top: active.offsetTop, height: active.offsetHeight } : null);
  }, [pathname, items.length]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-6 pb-[22px] pt-[26px]">
        <b className="block text-[20px] font-semibold tracking-[-0.4px]">{BRAND.name}</b>
        <span className="text-label uppercase tracking-[1.4px] text-ink-faint">{console.label}</span>
      </div>
      <nav ref={nav} aria-label={console.label} className="relative min-h-0 flex-1 overflow-y-auto px-3.5 py-3">
        {pill ? (
          <span
            aria-hidden
            className="absolute inset-x-3.5 rounded-nav bg-paper shadow-[0_1px_0_#1111110f,0_8px_20px_-12px_#11111159] transition-[top,height] duration-300 ease-[var(--ease-out)]"
            style={{ top: pill.top, height: pill.height }}
          />
        ) : null}
        {groups.map((group) => (
          <div key={group} className="mb-2">
            <p className="px-2.5 pb-1 pt-2 text-label uppercase text-ink-faint">{group}</p>
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <SidebarItem key={item.label} item={item} active={item === current} onNavigate={onNavigate} />
              ))}
          </div>
        ))}
      </nav>
      <div className="mx-4 mb-[18px] mt-3">
        <NotebookNote tone="lime" tilt="slight" className="py-4 pl-[42px] pr-4 text-small">
          <b className="font-semibold">Need a hand?</b>
          <br />
          {BRAND.supportPromise}
        </NotebookNote>
      </div>
    </div>
  );
}

function ToneIcon({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-[9px] transition-[background-color,scale] duration-300 ease-[var(--ease-spring)]",
        active ? cn(toneSurface[item.tone], "scale-105") : "bg-transparent group-hover:bg-paper",
      )}
    >
      <Icon name={item.icon} className="h-[18px] w-[18px]" />
    </span>
  );
}

function SidebarItem({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  if (!item.href) {
    return (
      <span className={cn(ITEM, "cursor-default text-ink-faint")} aria-disabled>
        <ToneIcon item={item} active={false} />
        {item.label}
        <span className="ml-auto rounded-chip bg-paper px-2 py-0.5 text-label uppercase">Soon</span>
      </span>
    );
  }
  return (
    <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={cn(ITEM, "group", active ? "font-medium text-ink" : "text-ink-soft hover:text-ink")}>
      <ToneIcon item={item} active={active} />
      {item.label}
      <span aria-hidden className={cn("ml-auto h-2 w-2 rounded-full transition-[scale,opacity] duration-300", toneSurface[item.tone], active ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
    </Link>
  );
}
