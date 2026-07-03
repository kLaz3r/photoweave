"use client";

import { useCallback, useRef, useState } from "react";

interface Snapshot<T> {
  data: T;
}

interface UseUndoRedoOptions {
  maxHistory?: number;
  debounceMs?: number;
}

export function useUndoRedo<T>({
  maxHistory = 50,
  debounceMs = 500,
}: UseUndoRedoOptions) {
  const pastRef = useRef<Snapshot<T>[]>([]);
  const futureRef = useRef<Snapshot<T>[]>([]);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<T | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateCanFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const flushPending = useCallback(() => {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    if (pendingRef.current) {
      pastRef.current.push({ data: pendingRef.current });
      if (pastRef.current.length > maxHistory) {
        pastRef.current.shift();
      }
      futureRef.current = [];
      pendingRef.current = null;
      updateCanFlags();
    }
  }, [maxHistory, updateCanFlags]);

  const pushConfigChange = useCallback(
    (data: T) => {
      pendingRef.current = data;
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
      pendingTimerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          pastRef.current.push({ data: pendingRef.current });
          if (pastRef.current.length > maxHistory) {
            pastRef.current.shift();
          }
          futureRef.current = [];
          pendingRef.current = null;
          pendingTimerRef.current = null;
          updateCanFlags();
        }
      }, debounceMs);
    },
    [debounceMs, maxHistory, updateCanFlags],
  );

  const pushAction = useCallback(
    (data: T) => {
      flushPending();
      pastRef.current.push({ data });
      if (pastRef.current.length > maxHistory) {
        pastRef.current.shift();
      }
      futureRef.current = [];
      updateCanFlags();
    },
    [flushPending, maxHistory, updateCanFlags],
  );

  const undo = useCallback(
    (current: T): T | null => {
      flushPending();
      if (pastRef.current.length === 0) return null;

      const snapshot = pastRef.current.pop()!;
      futureRef.current.push({ data: current });
      updateCanFlags();
      return snapshot.data;
    },
    [flushPending, updateCanFlags],
  );

  const redo = useCallback(
    (current: T): T | null => {
      flushPending();
      if (futureRef.current.length === 0) return null;

      const snapshot = futureRef.current.pop()!;
      pastRef.current.push({ data: current });
      updateCanFlags();
      return snapshot.data;
    },
    [flushPending, updateCanFlags],
  );

  const clear = useCallback(() => {
    flushPending();
    pastRef.current = [];
    futureRef.current = [];
    updateCanFlags();
  }, [flushPending, updateCanFlags]);

  return {
    canUndo,
    canRedo,
    pushConfigChange,
    pushAction,
    undo,
    redo,
    clear,
  };
}
