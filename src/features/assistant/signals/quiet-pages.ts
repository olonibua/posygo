const KEY = "posygo.helper.quiet-pages";

function read(): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export function isQuietPage(pattern: string): boolean {
  return read().includes(pattern);
}

export function quietPage(pattern: string): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...new Set([...read(), pattern])].slice(-50)));
  } catch {
    return;
  }
}
