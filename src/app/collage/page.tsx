"use client";

import { useMemo, useState } from "react";

type Thumb = { id: string; src: string };

export default function CollagePage() {
  const [thumbs] = useState<Thumb[]>(
    Array.from({ length: 3 }).map((_, i) => ({
      id: String(i + 1),
      src: "/hero-photo.png",
    })),
  );

  const fileStats = useMemo(() => ({ count: 25, sizeMB: 130 }), []);

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
              <span className="ml-3 inline-flex h-10 w-12 items-center justify-center rounded-lg border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_60%,transparent)] text-2xl backdrop-blur-sm">
                🖨️
              </span>
            </h2>

            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm opacity-80">
                  Canvas Type
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 text-base backdrop-blur-sm">
                    <option>Print</option>
                    <option>Digital</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm opacity-80">Size</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm">
                    <option>3x4/Custom</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm opacity-80">Width</label>
                  <input
                    className="placeholder:text-text/40 w-full rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 backdrop-blur-sm"
                    placeholder="mm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm opacity-80">
                    Height
                  </label>
                  <input
                    className="placeholder:text-text/40 w-full rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 backdrop-blur-sm"
                    placeholder="mm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm opacity-80">
                  Resolution
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm">
                    <option>300 DPI (High)</option>
                    <option>150 DPI</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm opacity-80">Format</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm">
                    <option>JPEG (Standard)</option>
                    <option>PNG</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--theme-accent)]"
                />
                Transparency
              </label>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm opacity-80">Layout</span>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-sm bg-[color:color-mix(in_oklch,var(--theme-text)_90%,transparent)]"
                      />
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] px-3 py-2 pr-9 backdrop-blur-sm">
                    <option>Masonry</option>
                    <option>Grid</option>
                  </select>
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                    ▾
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--theme-accent)]"
                />
                Maintain Aspect Ratio
              </label>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[color:var(--theme-accent)]"
                />
                Apply Shadow Effects
              </label>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
