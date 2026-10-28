import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DraftStore, StoredDraft } from "./draft-store";
import { useFormDraft } from "./use-form-draft";

interface Values {
  name: string;
  secret: string;
}

function memoryStore(seed: Record<string, StoredDraft> = {}) {
  const drafts = new Map(Object.entries(seed));
  const store: DraftStore = {
    load: vi.fn(async (key: string) => drafts.get(key) ?? null),
    save: vi.fn(async (key: string, data: Record<string, unknown>) => {
      const draft = { data, updatedAt: "2026-10-28T11:40:00.000Z" };
      drafts.set(key, draft);
      return draft;
    }),
    remove: vi.fn(async (key: string) => {
      drafts.delete(key);
    }),
  };
  return { store, drafts };
}

function useDraftedForm(store: DraftStore) {
  const [values, setValues] = useState<Values>({ name: "", secret: "" });
  const draft = useFormDraft({ key: "product:new", values, onRestore: setValues, store, keep: (current) => ({ ...current, secret: "" }) });
  return { values, setValues, draft };
}

describe("useFormDraft", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("brings back a saved draft", async () => {
    const { store } = memoryStore({ "product:new": { data: { name: "Linen shirt" }, updatedAt: "2026-10-27T09:00:00.000Z" } });
    const { result } = renderHook(() => useDraftedForm(store));
    await waitFor(() => expect(result.current.values.name).toBe("Linen shirt"));
    expect(result.current.draft.restoredAt).toBe("2026-10-27T09:00:00.000Z");
  });

  it("saves changes after a pause, leaving out what it should not keep", async () => {
    const { store, drafts } = memoryStore();
    const { result } = renderHook(() => useDraftedForm(store));
    await waitFor(() => expect(store.load).toHaveBeenCalled());
    act(() => result.current.setValues({ name: "Wool scarf", secret: "AB123456" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(drafts.get("product:new")?.data).toEqual({ name: "Wool scarf", secret: "" });
    expect(result.current.draft.savedAt).not.toBeNull();
  });

  it("discards back to the empty form and forgets the draft", async () => {
    const { store, drafts } = memoryStore({ "product:new": { data: { name: "Linen shirt" }, updatedAt: "2026-10-27T09:00:00.000Z" } });
    const { result } = renderHook(() => useDraftedForm(store));
    await waitFor(() => expect(result.current.values.name).toBe("Linen shirt"));
    act(() => result.current.draft.discard());
    expect(result.current.values.name).toBe("");
    await waitFor(() => expect(drafts.has("product:new")).toBe(false));
  });

  it("stops saving once the form is sent", async () => {
    const { store, drafts } = memoryStore();
    const { result } = renderHook(() => useDraftedForm(store));
    await waitFor(() => expect(store.load).toHaveBeenCalled());
    act(() => result.current.setValues({ name: "Wool scarf", secret: "" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
      await result.current.draft.clear();
    });
    act(() => result.current.setValues({ name: "Changed after", secret: "" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(drafts.has("product:new")).toBe(false);
  });
});
