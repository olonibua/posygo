export type HelperAction =
  | { kind: "explain-page"; label: string }
  | { kind: "explain-field"; label: string; field: string }
  | { kind: "report-error"; label: string }
  | { kind: "ask-team"; label: string }
  | { kind: "link"; label: string; href: string }
  | { kind: "voice"; label: string; on: boolean }
  | { kind: "show-field"; label: string; field: string }
  | { kind: "fix-field"; label: string; field: string; value: string }
  | { kind: "tour-start"; label: string }
  | { kind: "tour-next"; label: string }
  | { kind: "tour-stop"; label: string };

export interface ChatMessage {
  id: string;
  from: "helper" | "person";
  text: string;
  actions?: readonly HelperAction[];
}

let counter = 0;

function nextId(): string {
  counter += 1;
  return `m${counter}`;
}

export function helperSays(text: string, actions?: readonly HelperAction[]): ChatMessage {
  return { id: nextId(), from: "helper", text, actions };
}

export function personSays(text: string): ChatMessage {
  return { id: nextId(), from: "person", text };
}
