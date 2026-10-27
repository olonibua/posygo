import { scrubSensitive, SUPPORT_TRAIL_LIMIT } from "@/shared";

export interface TrailStep {
  at: string;
  what: string;
}

export class Trail {
  private steps: TrailStep[] = [];

  add(what: string, at = new Date()): void {
    const clean = scrubSensitive(what).replace(/\s+/g, " ").trim().slice(0, 160);
    if (!clean || this.steps.at(-1)?.what === clean) {
      return;
    }
    this.steps = [...this.steps, { at: at.toISOString(), what: clean }].slice(-SUPPORT_TRAIL_LIMIT);
  }

  recent(): TrailStep[] {
    return [...this.steps];
  }
}

export const trail = new Trail();
