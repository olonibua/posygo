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

import { activeItem, type Console, isLocked, type NavItem, visibleItems } from "./navigation";

const ITEM = "motion-press relative z-[1] flex items-center gap-3 rounded-nav px-2.5 py-[7px] text-[15px] no-underline";

interface SidebarProps {
  console: Console;
  user: SessionUser;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const FADE = "whitespace-nowrap transition-opacity duration-200";

export function Sidebar({ console, user, onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const items = visibleItems(console, user);
  const current = activeItem(items, pathname);
  const groups = [...new Set(items.map((item) => item.group))];
  const nav = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const active = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    setPill(active ? { top: active.offsetTop, height: active.offsetHeight } : null);
  }, [pathname, items.length, collapsed]);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-[76px] shrink-0 items-center gap-2 border-b border-line px-5", collapsed && "justify-center px-0")}>
        <div className={cn("min-w-0 flex-1", FADE, collapsed && "hidden")}>
          <b className="block text-[20px] font-semibold leading-tight tracking-[-0.4px]">{BRAND.name}</b>
          <span className="block truncate text-label uppercase tracking-[1.4px] text-ink-faint">{console.label}</span>
        </div>
        {onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="motion-press grid h-9 w-9 shrink-0 place-items-center rounded-nav text-ink-soft hover:bg-paper-sunk hover:text-ink"
          >
            <Icon name="collapse" className={cn("h-[18px] w-[18px] transition-transform duration-300 ease-[var(--ease-out)]", collapsed && "rotate-180")} />
          </button>
        ) : null}
      </div>
      <nav ref={nav} aria-label={console.label} className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3">
        {pill ? (
          <span
            aria-hidden
            className="absolute inset-x-3.5 rounded-nav bg-paper shadow-[0_1px_0_#1111110f,0_8px_20px_-12px_#11111159] transition-[top,height] duration-300 ease-[var(--ease-out)]"
            style={{ top: pill.top, height: pill.height }}
          />
        ) : null}
        {groups.map((group) => (
          <div key={group} className="mb-2">
            <p aria-hidden={collapsed} className={cn("px-2.5 pb-1 pt-2 text-label uppercase text-ink-faint", FADE, collapsed && "opacity-0")}>
              {group}
            </p>
            {items
              .filter((item) => item.group === group)
              .map((item) => (
                <SidebarItem key={item.label} item={item} active={item === current} locked={isLocked(item, user)} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
          </div>
        ))}
      </nav>
      <div className={cn("mx-4 mb-[18px] mt-3", collapsed && "hidden")}>
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

const LOCKED_NOTE = "Opens once your account is live";

interface SidebarItemProps {
  item: NavItem;
  active: boolean;
  locked: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

function SidebarItem({ item, active, locked, collapsed, onNavigate }: SidebarItemProps) {
  const label = <span className={cn(FADE, collapsed && "opacity-0")}>{item.label}</span>;
  if (locked) {
    return (
      <span className={cn(ITEM, "cursor-not-allowed text-ink-faint")} aria-disabled title={LOCKED_NOTE}>
        <ToneIcon item={item} active={false} />
        {label}
        <span className="sr-only">, {LOCKED_NOTE.toLowerCase()}</span>
        <Icon name="lock" className={cn("ml-auto h-3.5 w-3.5 shrink-0", FADE, collapsed && "opacity-0")} />
      </span>
    );
  }
  if (!item.href) {
    return (
      <span className={cn(ITEM, "cursor-default text-ink-faint")} aria-disabled title={collapsed ? item.label : undefined}>
        <ToneIcon item={item} active={false} />
        {label}
        <span className={cn("ml-auto rounded-chip bg-paper px-2 py-0.5 text-label uppercase", FADE, collapsed && "opacity-0")}>Soon</span>
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(ITEM, "group", active ? "font-medium text-ink" : "text-ink-soft hover:text-ink")}
    >
      <ToneIcon item={item} active={active} />
      {label}
      <span
        aria-hidden
        className={cn("ml-auto h-2 w-2 shrink-0 rounded-full transition-[scale,opacity] duration-300", toneSurface[item.tone], active && !collapsed ? "scale-100 opacity-100" : "scale-0 opacity-0")}
      />
    </Link>
  );
}
