const STORAGE_KEY = "posygo.hints-seen";
const EVERY_HINT = "*";

type Listener = () => void;

const listeners = new Set<Listener>();
let seen: ReadonlySet<string> | null = null;
let open: string | null = null;

function readSeen(): ReadonlySet<string> {
  if (seen) {
    return seen;
  }
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    seen = new Set(Array.isArray(stored) ? stored.filter((entry): entry is string => typeof entry === "string") : []);
  } catch {
    seen = new Set();
  }
  return seen;
}

function writeSeen(next: ReadonlySet<string>): void {
  seen = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    return;
  }
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export const hintStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  openId(): string | null {
    return open;
  },
  offer(id: string): void {
    const already = readSeen();
    if (open === null && !already.has(id) && !already.has(EVERY_HINT)) {
      open = id;
      emit();
    }
  },
  show(id: string): void {
    open = id;
    emit();
  },
  close(id: string): void {
    if (open === id) {
      open = null;
      emit();
    }
  },
  dismiss(id: string): void {
    writeSeen(new Set([...readSeen(), id]));
    if (open === id) {
      open = null;
    }
    emit();
  },
};
