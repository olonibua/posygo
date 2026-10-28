import type { DraftResult, DraftView } from "@/shared";

import { apiRequest } from "@/lib/api/client";

export interface StoredDraft {
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface DraftStore {
  load(key: string): Promise<StoredDraft | null>;
  save(key: string, data: Record<string, unknown>): Promise<StoredDraft>;
  remove(key: string): Promise<void>;
}

const path = (key: string) => `/v1/drafts/${encodeURIComponent(key)}`;

export const accountDraftStore: DraftStore = {
  async load(key) {
    return (await apiRequest<DraftResult>(path(key), { quiet: true })).draft;
  },
  async save(key, data) {
    return apiRequest<DraftView>(path(key), { method: "PUT", body: { data }, quiet: true });
  },
  async remove(key) {
    await apiRequest<void>(path(key), { method: "DELETE", quiet: true });
  },
};

const DEVICE_PREFIX = "posygo.draft.";

function readDevice(key: string): StoredDraft | null {
  try {
    const raw = window.localStorage.getItem(DEVICE_PREFIX + key);
    return raw ? (JSON.parse(raw) as StoredDraft) : null;
  } catch {
    return null;
  }
}

export const deviceDraftStore: DraftStore = {
  async load(key) {
    return readDevice(key);
  },
  async save(key, data) {
    const draft = { data, updatedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(DEVICE_PREFIX + key, JSON.stringify(draft));
    } catch {
      return draft;
    }
    return draft;
  },
  async remove(key) {
    try {
      window.localStorage.removeItem(DEVICE_PREFIX + key);
    } catch {
      return;
    }
  },
};
