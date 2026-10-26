export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
  createdAt: number;
}

interface ToastState {
  visible: readonly Toast[];
  history: readonly Toast[];
  unseen: number;
}

const VISIBLE_LIMIT = 3;
const HISTORY_LIMIT = 20;

let state: ToastState = { visible: [], history: [], unseen: 0 };
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: ToastState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function push(tone: ToastTone, title: string, body?: string) {
  const toast: Toast = { id: nextId++, tone, title, body, createdAt: Date.now() };
  emit({ visible: [...state.visible, toast].slice(-VISIBLE_LIMIT), history: [toast, ...state.history].slice(0, HISTORY_LIMIT), unseen: state.unseen + 1 });
}

export const toast = {
  success: (title: string, body?: string) => push("success", title, body),
  error: (title: string, body?: string) => push("error", title, body),
  info: (title: string, body?: string) => push("info", title, body),
};

export function dismissToast(id: number) {
  emit({ ...state, visible: state.visible.filter((item) => item.id !== id) });
}

export function markToastsSeen() {
  if (state.unseen > 0) {
    emit({ ...state, unseen: 0 });
  }
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toastSnapshot(): ToastState {
  return state;
}

const EMPTY: ToastState = { visible: [], history: [], unseen: 0 };

export function serverToastSnapshot(): ToastState {
  return EMPTY;
}
