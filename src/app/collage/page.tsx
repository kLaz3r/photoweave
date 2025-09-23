"use client";

import { useMemo, useState } from "react";
import {
  DigitalIcon,
  GridIcon,
  MasonryIcon,
  PrintIcon,
} from "~/components/icons";

type Thumb = { id: string; src: string };
type CanvasType = "Print" | "Digital";
type LayoutType = "Masonry" | "Grid";

export default function CollagePage() {
  const [thumbs] = useState<Thumb[]>(
    Array.from({ length: 3 }).map((_, i) => ({
      id: String(i + 1),
      src: "/hero-photo.png",
    })),
  );

  const fileStats = useMemo(() => ({ count: 25, sizeMB: 130 }), []);

  // Form state
  const [canvasType, setCanvasType] = useState<CanvasType>("Print");
  const [sizePreset, setSizePreset] = useState<string>("Custom Dimensions");
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [resolution, setResolution] = useState<string>("150 DPI (Standard)");
  const [format, setFormat] = useState<string>("JPEG (Smallest File Size)");
  const [transparency, setTransparency] = useState<boolean>(false);
  const [layout, setLayout] = useState<LayoutType>("Masonry");
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);

  // placeholder is computed inline where used

  const printSizeOptions: string[] = [
    "9x13cm (Portrait)",
    "13x9cm (Landscape)",
    "10x15cm (Portrait)",
    "15x10cm (Landscape)",
    "13x18cm (Portrait)",
    "18x13cm (Landscape)",
    "15x20cm (Portrait)",
    "20x15cm (Landscape)",
    "20x25cm (Portrait)",
    "25x20cm (Landscape)",
    "21x29.7cm A4 (Portrait)",
    "29.7x21cm A4 (Landscape)",
    "30x40cm (Portrait)",
    "40x30cm (Landscape)",
    "29.7x42.0cm A3 (Portrait)",
    "42.0x29.7cm A3 (Landscape)",
    "40x50cm (Portrait)",
    "50x40cm (Landscape)",
    "50x70cm (Portrait)",
    "70x50cm (Landscape)",
    "100x70cm (Portrait)",
    "70x100cm (Landscape)",
    "Custom Dimensions",
  ];

  const digitalSizeOptions: Array<
    { group: string; options: string[] } | { label: string; value: string }
  > = [
    {
      group: "Phone Screens",
      options: [
        "1080x1920 (Portrait)",
        "1920x1080 (Landscape)",
        "1170x2532 iPhone (Portrait)",
        "2532x1170 iPhone (Landscape)",
      ],
    },
    {
      group: "Desktop Wallpapers",
      options: [
        "1920x1080 (Landscape)",
        "2560x1440 (Landscape)",
        "3840x2160 4K (Landscape)",
        "1080x1920 (Portrait)",
        "1440x2560 (Portrait)",
        "2160x3840 4K (Portrait)",
      ],
    },
    {
      group: "Social Media",
      options: [
        "Instagram 1080x1080 (Square)",
        "Instagram 1080x1350 (Portrait)",
        "Instagram 1080x566 (Landscape)",
        "Instagram Story/Reel 1080x1920",
        "Facebook Post 1200x630",
        "Facebook Cover 820x312",
        "Twitter/X Header 1500x500",
        "LinkedIn Post 1200x627",
        "YouTube Thumbnail 1280x720",
        "Pinterest Pin 1000x1500",
      ],
    },
    { label: "Custom Dimensions", value: "Custom Dimensions" },
  ];

  const onChangeCanvasType = (v: CanvasType) => {
    setCanvasType(v);
    setSizePreset("Custom Dimensions");
    setCustomWidth("");
    setCustomHeight("");
    setResolution("150 DPI (Standard)");
  };

  const onChangeFormat: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = e.target.value;
    setFormat(next);
    if (!next.startsWith("PNG")) setTransparency(false);
  };

  return (
    <main className="text-text container mx-auto mt-[96px] mb-16 px-4">
      <section className="relative rounded-[28px] border border-[color:color-mix(in_oklch,var(--theme-text)_10%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--theme-background)_60%,transparent),color-mix(in_oklch,var(--theme-background)_30%,transparent))] p-6 shadow-2xl backdrop-blur-2xl md:p-8 lg:p-10">
        <div className="absolute inset-0 -z-10 rounded-[28px] bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(168,149,255,0.28),rgba(255,255,255,0)_60%),radial-gradient(1200px_600px_at_110%_110%,rgba(255,160,140,0.35),rgba(255,255,255,0)_60%)]"></div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Left: File Upload */}
          <div>
            <h2 className="font-display mb-4 text-2xl md:text-3xl">
              File Upload
            </h2>
            <div className="text-text/80 flex min-h-56 items-center justify-center rounded-2xl border-2 border-dashed border-[color:color-mix(in_oklch,var(--theme-text)_25%,transparent)] p-6">
              <span className="text-center text-xl">
                Drag & Drop
                <br /> Photos Here
              </span>
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-full bg-[color:var(--theme-primary)]/80 px-6 py-3 text-lg font-semibold text-white transition hover:bg-[color:var(--theme-primary)]"
            >
              Choose Files
            </button>
            <div className="mt-4 text-sm opacity-80">
              <p>
                File Support:
                <br /> JPEG, PNG, GIF, BMP, TIFF, WEBP
              </p>
              <p className="mt-2">
                {fileStats.count} Files, {fileStats.sizeMB} MB
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {thumbs.map((t) => (
                <div
                  key={t.id}
                  className="relative h-20 w-full rounded-md bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]"
                >
                  <button
                    type="button"
                    aria-label="Remove"
                    className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-current/20 px-6 py-3 text-base"
            >
              <span className="mr-2">×</span>Clear All
            </button>
          </div>

          {/* Middle: Preview */}
          <div>
            <h2 className="font-display mb-4 text-2xl md:text-3xl">
              Collage Preview
            </h2>
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_65%,transparent)] backdrop-blur-md">
              <span className="opacity-60">Preview</span>
            </div>
            <div className="mt-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span>Status: Pending</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]">
                <div className="h-2 w-1/5 rounded-full bg-[color:var(--theme-accent)]"></div>
              </div>
              <p className="mt-2">Job ID: 69420</p>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-current/20 px-6 py-3 text-base"
              >
                Preview
              </button>
              <button
                type="button"
                className="rounded-full bg-[color:var(--theme-accent)] px-6 py-3 text-base font-semibold text-white hover:opacity-90"
              >
                Download
              </button>
            </div>
            <div className="mt-6 h-px w-full bg-current/20" />
            <p className="mt-6 text-center text-sm opacity-70">
              *Collage Making Animation*
            </p>
          </div>

          {/* Right: Configuration */}
          <div>
            <h2 className="font-display mb-4 flex items-center justify-between text-2xl md:text-3xl">
              Configuration
              <span
                aria-label={`Canvas Type: ${canvasType}`}
                className="ml-3 inline-flex items-center gap-4 rounded-3xl border border-[color:var(--theme-accent)] px-6 py-3 shadow-xl backdrop-blur-md"
              >
                {canvasType === "Print" ? (
                  <PrintIcon
                    height={40}
                    className="text-[color:var(--theme-accent)]"
                  />
                ) : (
                  <DigitalIcon
                    height={40}
                    className="text-[color:var(--theme-accent)]"
                  />
                )}
                <span className="font-display text-2xl font-bold tracking-wide text-[color:var(--theme-text)]">
                  {canvasType}
                </span>
              </span>
            </h2>

            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm opacity-80">
                  Canvas Type
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 text-base backdrop-blur-sm"
                    value={canvasType}
                    onChange={(e) =>
                      onChangeCanvasType(e.target.value as CanvasType)
                    }
                  >
                    <option value="Print">Print</option>
                    <option value="Digital">Digital</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm opacity-80">
                  Size Presets
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm"
                    value={sizePreset}
                    onChange={(e) => setSizePreset(e.target.value)}
                  >
                    {canvasType === "Print" ? (
                      <>
                        {printSizeOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </>
                    ) : (
                      <>
                        {digitalSizeOptions.map((entry, idx) =>
                          "group" in entry ? (
                            <optgroup key={idx} label={entry.group}>
                              {entry.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            <option key={entry.value} value={entry.value}>
                              {entry.label}
                            </option>
                          ),
                        )}
                      </>
                    )}
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              {sizePreset === "Custom Dimensions" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm opacity-80">
                      Width
                    </label>
                    <input
                      className="placeholder:text-text/40 w-full rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 backdrop-blur-sm"
                      placeholder={canvasType === "Print" ? "mm" : "px"}
                      value={customWidth}
                      onChange={(e) => setCustomWidth(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm opacity-80">
                      Height
                    </label>
                    <input
                      className="placeholder:text-text/40 w-full rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 backdrop-blur-sm"
                      placeholder={canvasType === "Print" ? "mm" : "px"}
                      value={customHeight}
                      onChange={(e) => setCustomHeight(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm opacity-80">
                  Resolution
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm disabled:opacity-60"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    disabled={canvasType === "Digital"}
                  >
                    <option value="300 DPI (High)">300DPI (High)</option>
                    <option value="150 DPI (Standard)">
                      150DPI (Standard)
                    </option>
                    <option value="96 DPI (Screen)">96DPI (Screen)</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm opacity-80">Format</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm"
                    value={format}
                    onChange={onChangeFormat}
                  >
                    <option value="JPEG (Smallest File Size)">
                      JPEG (Smallest File Size)
                    </option>
                    <option value="PNG (Transparency)">
                      PNG (Transparency)
                    </option>
                    <option value="TIFF (Print Quality)">
                      TIFF (Print Quality)
                    </option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>
              {format.startsWith("PNG") && (
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[color:var(--theme-accent)]"
                    checked={transparency}
                    onChange={(e) => setTransparency(e.target.checked)}
                  />
                  Transparency
                </label>
              )}

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm opacity-80">Layout</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayout("Masonry")}
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-xl border px-5 py-4",
                      layout === "Masonry"
                        ? "border-[color:var(--theme-accent)]"
                        : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                      "bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] backdrop-blur-sm",
                    ].join(" ")}
                  >
                    <MasonryIcon
                      height={44}
                      className="text-[color:var(--theme-text)]"
                    />
                    <span className="mt-1 text-base">Masonry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayout("Grid")}
                    className={[
                      "flex flex-col items-center justify-center gap-2 rounded-xl border px-5 py-4",
                      layout === "Grid"
                        ? "border-[color:var(--theme-accent)]"
                        : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                      "bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] backdrop-blur-sm",
                    ].join(" ")}
                  >
                    <GridIcon
                      height={44}
                      className="text-[color:var(--theme-text)]"
                    />
                    <span className="mt-1 text-base">Grid</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--theme-accent)]"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                />
                Maintain Aspect Ratio
              </label>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
