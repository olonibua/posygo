export const DWELL_MS = 45_000;
const QUIET_TYPING_MS = 6_000;
const COOLDOWN_MS = 3 * 60_000;
const REPEATED_ERRORS = 2;

interface Focus {
  label: string;
  since: number;
  lastEdit: number;
}

export class HesitationTracker {
  private focus: Focus | null = null;
  private lastNudge = Number.NEGATIVE_INFINITY;
  private readonly helped = new Set<string>();
  private readonly fieldErrors = new Map<string, number>();

  focused(label: string, now: number): void {
    if (this.focus?.label !== label) {
      this.focus = { label, since: now, lastEdit: now };
    }
  }

  edited(label: string, now: number): void {
    this.focused(label, now);
    this.focus!.lastEdit = now;
  }

  left(): void {
    this.focus = null;
  }

  fieldRejected(label: string, now: number): string | null {
    const count = (this.fieldErrors.get(label) ?? 0) + 1;
    this.fieldErrors.set(label, count);
    return count >= REPEATED_ERRORS ? this.claim(label, now) : null;
  }

  fieldAccepted(label: string): void {
    this.fieldErrors.delete(label);
  }

  stuckOn(now: number): string | null {
    const focus = this.focus;
    if (!focus || now - focus.since < DWELL_MS || now - focus.lastEdit < QUIET_TYPING_MS) {
      return null;
    }
    return this.claim(focus.label, now);
  }

  private claim(label: string, now: number): string | null {
    if (this.helped.has(label) || now - this.lastNudge < COOLDOWN_MS) {
      return null;
    }
    this.helped.add(label);
    this.lastNudge = now;
    return label;
  }
}
