/**
 * Hook for lazy-loading the MediaPipe face detector.
 */
"use client";

import { useCallback, useRef, useState } from "react";

type DetectorState = "idle" | "loading" | "ready" | "error";

export function useFaceDetector() {
  const [state, setState] = useState<DetectorState>("idle");
  const errorRef = useRef<string | null>(null);

  const ensureLoaded = useCallback(async () => {
    if (state === "ready" || state === "loading") return;
    if (typeof window === "undefined") return;

    setState("loading");
    try {
      // Trigger the dynamic import — detector is lazy in face-detection.ts
      const { detectFaces } = await import("~/lib/collage/face-detection");
      // Warm up: run a tiny 1x1 canvas through the detector
      const warmup = document.createElement("canvas");
      warmup.width = 100;
      warmup.height = 100;
      await detectFaces(warmup);
      setState("ready");
    } catch (err) {
      errorRef.current =
        err instanceof Error ? err.message : "Face detector failed";
      setState("error");
    }
  }, [state]);

  return {
    isLoading: state === "loading",
    isReady: state === "ready",
    isError: state === "error",
    error: errorRef.current,
    ensureLoaded,
  };
}
