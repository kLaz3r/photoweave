"use client";

import type { CollageConfig } from "~/lib/collage/config";
import { GridIcon, MasonryIcon } from "~/components/icons";

const PRINT_PRESETS = [
  "9x13cm",
  "13x9cm",
  "10x15cm",
  "15x10cm",
  "13x18cm",
  "18x13cm",
  "15x20cm",
  "20x15cm",
  "21x29.7cm A4",
  "29.7x21cm A4",
  "30x40cm",
  "40x30cm",
  "29.7x42cm A3",
  "42x29.7cm A3",
  "40x50cm",
  "50x40cm",
  "50x70cm",
  "70x50cm",
  "100x70cm",
  "70x100cm",
];

const DIGITAL_PRESETS = [
  "1080x1920",
  "1920x1080",
  "2560x1440",
  "3840x2160",
  "1080x1080",
  "1200x630",
  "1500x500",
  "1280x720",
  "1000x1500",
];

const DPI_OPTIONS = [
  { label: "300 DPI (High)", value: 300 },
  { label: "150 DPI (Standard)", value: 150 },
  { label: "96 DPI (Screen)", value: 96 },
];

const FORMAT_OPTIONS = [
  { label: "JPEG", value: "jpeg" },
  { label: "PNG", value: "png" },
] as const;

interface ConfigPanelProps {
  config: CollageConfig;
  onChange: (next: CollageConfig) => void;
  onFaceDetectorLoading: boolean;
  onFaceDetectorReady: boolean;
  onEnsureFaceDetector: () => void;
}

function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm opacity-80">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (!Number.isNaN(n)) onChange(n);
          }}
          className="w-full rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 backdrop-blur-sm"
        />
        <span className="text-sm opacity-60">{unit}</span>
      </div>
    </div>
  );
}

export function ConfigPanel({
  config,
  onChange,
  onFaceDetectorLoading,
  onFaceDetectorReady,
  onEnsureFaceDetector,
}: ConfigPanelProps) {
  const update = (patch: Partial<CollageConfig>) =>
    onChange({ ...config, ...patch });

  const { w: canvasW, h: canvasH } =
    config.dimensionMode === "mm"
      ? {
          w: Math.round((config.widthMm / 25.4) * config.dpi),
          h: Math.round((config.heightMm / 25.4) * config.dpi),
        }
      : { w: config.widthPx, h: config.heightPx };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="font-display text-2xl md:text-3xl">Configuration</h2>

      <form className="space-y-5">
        {/* Dimension mode */}
        <div>
          <label className="mb-1 block text-sm opacity-80">Dimension Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {(["px", "mm"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  if (mode === "mm") {
                    update({ dimensionMode: "mm", widthMm: 304.8, heightMm: 457.2, dpi: 150 });
                  } else {
                    update({ dimensionMode: "px", widthPx: 1920, heightPx: 1080, dpi: 96 });
                  }
                }}
                className={[
                  "rounded-xl border px-4 py-3 text-center text-sm font-medium transition-colors",
                  config.dimensionMode === mode
                    ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/10 text-[color:var(--theme-accent)]"
                    : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                ].join(" ")}
              >
                {mode === "px" ? "Pixels (Digital)" : "Millimeters (Print)"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs opacity-50">
            Canvas: {canvasW} × {canvasH} px{" "}
            {config.dimensionMode === "mm"
              ? `(${config.widthMm.toFixed(1)} × ${config.heightMm.toFixed(1)} mm)`
              : ""}
          </p>
        </div>

        {/* Size presets */}
        <div>
          <label className="mb-1 block text-sm opacity-80">Size Presets</label>
          <div className="relative">
            <select
              className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm"
              value={
                config.dimensionMode === "mm"
                  ? `${config.widthMm}x${config.heightMm}`
                  : `${config.widthPx}x${config.heightPx}`
              }
              onChange={(e) => {
                const parts = e.target.value.split("x");
                if (parts.length !== 2) return;
                const v1 = parseFloat(parts[0]!);
                const v2 = parseFloat(parts[1]!);
                if (Number.isNaN(v1) || Number.isNaN(v2)) return;
                if (config.dimensionMode === "mm") {
                  update({ widthMm: v1, heightMm: v2 });
                } else {
                  update({ widthPx: Math.round(v1), heightPx: Math.round(v2) });
                }
              }}
            >
              {(config.dimensionMode === "mm" ? PRINT_PRESETS : DIGITAL_PRESETS).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm opacity-60">▾</span>
          </div>
        </div>

        {/* Custom dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width"
            value={
              config.dimensionMode === "mm" ? config.widthMm : config.widthPx
            }
            min={config.dimensionMode === "mm" ? 50 : 320}
            max={config.dimensionMode === "mm" ? 1219.2 : 20000}
            step={config.dimensionMode === "mm" ? 0.1 : 1}
            unit={config.dimensionMode === "mm" ? "mm" : "px"}
            onChange={(v) =>
              update(
                config.dimensionMode === "mm"
                  ? { widthMm: v }
                  : { widthPx: v },
              )
            }
          />
          <NumberInput
            label="Height"
            value={
              config.dimensionMode === "mm" ? config.heightMm : config.heightPx
            }
            min={config.dimensionMode === "mm" ? 50 : 320}
            max={config.dimensionMode === "mm" ? 1219.2 : 20000}
            step={config.dimensionMode === "mm" ? 0.1 : 1}
            unit={config.dimensionMode === "mm" ? "mm" : "px"}
            onChange={(v) =>
              update(
                config.dimensionMode === "mm"
                  ? { heightMm: v }
                  : { heightPx: v },
              )
            }
          />
        </div>

        {/* DPI (print only) */}
        {config.dimensionMode === "mm" && (
          <div>
            <label className="mb-1 block text-sm opacity-80">Resolution</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm"
                value={config.dpi}
                onChange={(e) => update({ dpi: Number(e.target.value) })}
              >
                {DPI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm opacity-60">▾</span>
            </div>
          </div>
        )}

        {/* Output format */}
        <div>
          <label className="mb-1 block text-sm opacity-80">Output Format</label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => update({ outputFormat: f.value })}
                className={[
                  "rounded-xl border px-4 py-2 text-center text-sm transition-colors",
                  config.outputFormat === f.value
                    ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/10 text-[color:var(--theme-accent)]"
                    : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm opacity-80">Layout</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update({ layoutStyle: "masonry" })}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-4 transition-colors",
                config.layoutStyle === "masonry"
                  ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/10"
                  : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
              ].join(" ")}
            >
              <MasonryIcon
                height={36}
                className="text-[color:var(--theme-text)]"
              />
              <span className="text-base">Masonry</span>
            </button>
            <button
              type="button"
              onClick={() => update({ layoutStyle: "grid" })}
              className={[
                "flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-4 transition-colors",
                config.layoutStyle === "grid"
                  ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]/10"
                  : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
              ].join(" ")}
            >
              <GridIcon
                height={36}
                className="text-[color:var(--theme-text)]"
              />
              <span className="text-base">Grid</span>
            </button>
          </div>
        </div>

        {/* Spacing */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-sm opacity-80">Spacing</span>
            <span className="text-xs opacity-60">{config.spacing}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={config.spacing}
            onChange={(e) => update({ spacing: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Background color */}
        <div>
          <label className="mb-1 block text-sm opacity-80">Background</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.backgroundColor.slice(0, 7)}
              onChange={(e) => update({ backgroundColor: e.target.value + "ff" })}
              className="h-10 w-14 cursor-pointer rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]"
            />
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="flex-1 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 font-mono text-sm backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.maintainAspectRatio}
              onChange={(e) =>
                update({ maintainAspectRatio: e.target.checked })
              }
              className="h-4 w-4 accent-[color:var(--theme-accent)]"
            />
            Maintain Aspect Ratio
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.applyShadow}
              onChange={(e) => update({ applyShadow: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--theme-accent)]"
            />
            Apply Shadow
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.pretrimBorders}
              onChange={(e) => update({ pretrimBorders: e.target.checked })}
              className="h-4 w-4 accent-[color:var(--theme-accent)]"
            />
            Pre-trim Borders
          </label>
        </div>

        {/* Face-aware section */}
        <div className="space-y-3 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config.faceAwareCropping}
              onChange={(e) => {
                const next = e.target.checked;
                if (next && !onFaceDetectorReady && !onFaceDetectorLoading) {
                  onEnsureFaceDetector();
                }
                update({ faceAwareCropping: next });
              }}
              disabled={onFaceDetectorLoading}
              className="h-4 w-4 accent-[color:var(--theme-accent)]"
            />
            Face-Aware Cropping
          </label>

          {config.faceAwareCropping && (
            <>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs opacity-70">Face Margin</span>
                  <span className="text-xs opacity-50">{config.faceMargin}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.01}
                  value={config.faceMargin}
                  onChange={(e) =>
                    update({ faceMargin: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              {onFaceDetectorLoading && (
                <p className="text-xs text-[color:var(--theme-accent)]">
                  Loading face detector…
                </p>
              )}

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={config.debugFaces}
                  onChange={(e) => update({ debugFaces: e.target.checked })}
                  className="h-4 w-4 accent-[color:var(--theme-accent)]"
                />
                Debug Faces
              </label>
            </>
          )}
        </div>
      </form>
    </div>
  );
}