"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { accountDraftStore, type DraftStore } from "./draft-store";

const SAVE_DELAY_MS = 900;

export interface FormDraftOptions<T> {
  key: string | null;
  values: T;
  onRestore: (values: T) => void;
  store?: DraftStore;
  keep?: (values: T) => Partial<T>;
}

export interface FormDraft<T> {
  restoredAt: string | null;
  savedAt: string | null;
  discard: () => void;
  clear: () => Promise<void>;
  settle: (saved: T) => void;
}

const serialise = (value: unknown) => JSON.stringify(value);

export function useFormDraft<T extends object>({ key, values, onRestore, store = accountDraftStore, keep }: FormDraftOptions<T>): FormDraft<T> {
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const initial = useRef(values);
  const latest = useRef(values);
  const stored = useRef(false);
  const lastSaved = useRef<string | null>(null);
  const finished = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restore = useRef(onRestore);
  const pick = useRef(keep);
  latest.current = values;
  restore.current = onRestore;
  pick.current = keep;

  const snapshot = useCallback((current: T) => (pick.current ? pick.current(current) : current) as Record<string, unknown>, []);

  const persist = useCallback(async () => {
    timer.current = null;
    if (!key || finished.current) {
      return;
    }
    const data = snapshot(latest.current);
    const text = serialise(data);
    if (text === lastSaved.current) {
      return;
    }
    try {
      if (text === serialise(snapshot(initial.current))) {
        if (stored.current) {
          await store.remove(key);
          stored.current = false;
          lastSaved.current = null;
          setSavedAt(null);
        }
        return;
      }
      const saved = await store.save(key, data);
      stored.current = true;
      lastSaved.current = text;
      setSavedAt(saved.updatedAt);
    } catch {
      return;
    }
  }, [key, snapshot, store]);

  useEffect(() => {
    if (!key) {
      return;
    }
    let active = true;
    const untouched = serialise(initial.current);
    store
      .load(key)
      .then((draft) => {
        if (!active || !draft || serialise(latest.current) !== untouched) {
          return;
        }
        const restored = { ...initial.current, ...draft.data } as T;
        stored.current = true;
        lastSaved.current = serialise(snapshot(restored));
        setRestoredAt(draft.updatedAt);
        setSavedAt(draft.updatedAt);
        restore.current(restored);
      })
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, [key, snapshot, store]);

  useEffect(() => {
    if (!ready || !key || finished.current) {
      return;
    }
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => void persist(), SAVE_DELAY_MS);
  }, [values, ready, key, persist]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
        void persist();
      }
    },
    [persist],
  );

  const discard = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    stored.current = false;
    lastSaved.current = null;
    setRestoredAt(null);
    setSavedAt(null);
    restore.current(initial.current);
    if (key) {
      void store.remove(key).catch(() => undefined);
    }
  }, [key, store]);

  const clear = useCallback(async () => {
    finished.current = true;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (key && stored.current) {
      await store.remove(key).catch(() => undefined);
    }
    stored.current = false;
  }, [key, store]);

  const settle = useCallback(
    (saved: T) => {
      initial.current = saved;
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      if (key && stored.current) {
        void store.remove(key).catch(() => undefined);
      }
      stored.current = false;
      lastSaved.current = null;
      setRestoredAt(null);
      setSavedAt(null);
    },
    [key, store],
  );

  return { restoredAt, savedAt, discard, clear, settle };
}
