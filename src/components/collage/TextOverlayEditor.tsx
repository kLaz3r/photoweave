"use client";

import { memo, useCallback, useRef } from "react";
import type { TextOverlay } from "~/lib/collage/config";

const FONT_OPTIONS = [
  "Georgia, serif",
  "Arial, sans-serif",
  "Impact, sans-serif",
  "Courier New, monospace",
  "Trebuchet MS, sans-serif",
  "Verdana, sans-serif",
  "Times New Roman, serif",
  "Comic Sans MS, cursive",
];

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
}

export const TextOverlayEditor = memo(function TextOverlayEditor({
  overlays,
  onChange,
}: TextOverlayEditorProps) {
  const idCounter = useRef(0);

  const addOverlay = useCallback(() => {
    const id = `text-${Date.now()}-${idCounter.current++}`;
    onChange([
      ...overlays,
      {
        id,
        text: "",
        fontFamily: "Georgia, serif",
        fontSize: 64,
        color: "#333333",
        opacity: 0.8,
        rotation: 0,
      },
    ]);
  }, [overlays, onChange]);

  const updateOverlay = useCallback(
    (id: string, patch: Partial<TextOverlay>) => {
      onChange(
        overlays.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      );
    },
    [overlays, onChange],
  );

  const removeOverlay = useCallback(
    (id: string) => {
      onChange(overlays.filter((o) => o.id !== id));
    },
    [overlays, onChange],
  );

  return (
    <div className="space-y-3">
      {overlays.map((overlay, idx) => (
        <div
          key={overlay.id}
          className="space-y-3 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium opacity-70">
              Text {idx + 1}
            </span>
            <button
              type="button"
              className="text-xs text-red-400 transition hover:text-red-300"
              onClick={() => removeOverlay(overlay.id)}
            >
              Remove
            </button>
          </div>

          <input
            type="text"
            placeholder="Enter text..."
            value={overlay.text}
            onChange={(e) => updateOverlay(overlay.id, { text: e.target.value })}
            className="w-full rounded-lg border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-1.5 text-sm backdrop-blur-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-xs opacity-60">
                Font
              </label>
              <select
                value={overlay.fontFamily}
                onChange={(e) =>
                  updateOverlay(overlay.id, { fontFamily: e.target.value })
                }
                className="w-full rounded-lg border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-2 py-1 text-xs backdrop-blur-sm"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f.split(",")[0]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs opacity-60">
                Size
              </label>
              <input
                type="number"
                min={8}
                max={500}
                value={overlay.fontSize}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) updateOverlay(overlay.id, { fontSize: v });
                }}
                className="w-full rounded-lg border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-2 py-1 text-xs backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-0.5 block text-xs opacity-60">
                Color
              </label>
              <input
                type="color"
                value={overlay.color}
                onChange={(e) =>
                  updateOverlay(overlay.id, { color: e.target.value })
                }
                className="h-8 w-full cursor-pointer rounded-lg border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs opacity-60">
                Opacity
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={overlay.opacity}
                onChange={(e) =>
                  updateOverlay(overlay.id, {
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="mb-0.5 block text-xs opacity-60">
                Rotate
              </label>
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={overlay.rotation}
                onChange={(e) =>
                  updateOverlay(overlay.id, {
                    rotation: parseInt(e.target.value, 10),
                  })
                }
                className="w-full"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="w-full rounded-full border border-current/20 px-4 py-2 text-xs transition hover:bg-white/5"
        onClick={addOverlay}
      >
        + Add Text Overlay
      </button>
    </div>
  );
});
