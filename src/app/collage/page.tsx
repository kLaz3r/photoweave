"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  DigitalIcon,
  GridIcon,
  MasonryIcon,
  PrintIcon,
} from "~/components/icons";
import { CreateCollageResponseSchema } from "~/lib/schemas/collage";

const CollageStatusMinimalSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]),
  progress: z.number().int().min(0).max(100).optional(),
  error_message: z.string().nullable().optional(),
});

type CanvasType = "Print" | "Digital";
type LayoutType = "Masonry" | "Grid";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string; // object URL for thumbnail
  shotTimeMs: number; // Date taken in ms since epoch (fallback to file.lastModified)
};

export default function CollagePage() {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const appendModeRef = useRef<boolean>(false);

  const fileStats = useMemo(() => {
    const count = selectedImages.length;
    const sizeBytes = selectedImages.reduce(
      (acc, img) => acc + img.file.size,
      0,
    );
    const sizeMB = Math.max(
      0.01,
      Number((sizeBytes / (1024 * 1024)).toFixed(2)),
    );
    return { count, sizeMB };
  }, [selectedImages]);

  // Form state
  const [canvasType, setCanvasType] = useState<CanvasType>("Print");
  const [sizePreset, setSizePreset] = useState<string>("40x30cm (Landscape)");
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [resolution, setResolution] = useState<string>("150 DPI (Standard)");
  const [format, setFormat] = useState<string>("JPEG (Smallest File Size)");
  const [transparency, setTransparency] = useState<boolean>(false);
  const [layout, setLayout] = useState<LayoutType>("Masonry");
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [spacing, setSpacing] = useState<number>(0.03);
  const [orderMode, setOrderMode] = useState<"chronological" | "random">(
    "chronological",
  );

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Download/job state
  const [isCreatingJob, setIsCreatingJob] = useState<boolean>(false);
  const [jobStatus, setJobStatus] = useState<
    "pending" | "processing" | "completed" | "failed" | null
  >(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const jobAbortRef = useRef<AbortController | null>(null);

  // Optimize Grid state
  const [isOptimizingGrid, setIsOptimizingGrid] = useState<boolean>(false);
  const [optimizeGridError, setOptimizeGridError] = useState<string | null>(
    null,
  );
  const [gridAdvice, setGridAdvice] = useState<{
    columns: number | null;
    rows: number | null;
    optimalNumImages: number | null;
    delta: number | null;
  }>({ columns: null, rows: null, optimalNumImages: null, delta: null });
  const optimizeAbortRef = useRef<AbortController | null>(null);
  const optimizeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
    // When switching types, pick sensible defaults with concrete dimensions
    if (v === "Print") {
      setSizePreset("40x30cm (Landscape)");
    } else {
      setSizePreset("1080x1920 (Portrait)");
    }
    setCustomWidth("");
    setCustomHeight("");
    setResolution("150 DPI (Standard)");
  };

  const onChangeFormat: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const next = e.target.value;
    setFormat(next);
    if (!next.startsWith("PNG")) setTransparency(false);
  };

  // Helpers
  function parseDpiFromResolution(value: string): number {
    const re = /(\d+)\s*DPI/i;
    const match = re.exec(value);
    return match ? parseInt(match[1]!, 10) : 150;
  }

  function parseDimensionsFromPreset(
    preset: string,
    kind: CanvasType,
  ): { width: number | null; height: number | null } {
    // Returns values in mm for Print, px for Digital
    const re = /(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/;
    const numbers = re.exec(preset);
    if (!numbers) return { width: null, height: null };
    let w = parseFloat(numbers[1]!);
    let h = parseFloat(numbers[2]!);
    if (kind === "Print") {
      // Values are in cm in preset labels → convert to mm
      // e.g., "21x29.7cm A4 (Portrait)"
      w = w * 10;
      h = h * 10;
    }
    // Respect explicit orientation in label if present
    const isLandscape = /(\(|\s)Landscape\)/i.test(preset);
    const isPortrait = /(\(|\s)Portrait\)/i.test(preset);
    if (isLandscape && w < h) {
      const tmp = w;
      w = h;
      h = tmp;
    } else if (isPortrait && w > h) {
      const tmp = w;
      w = h;
      h = tmp;
    }
    return { width: w, height: h };
  }

  function getNumericCustom(value: string): number | null {
    const num = parseFloat(value);
    return isFinite(num) && !isNaN(num) ? num : null;
  }

  function getOutputFormat(): "jpeg" | "png" | "tiff" {
    if (format.startsWith("PNG")) return "png";
    if (format.startsWith("TIFF")) return "tiff";
    return "jpeg";
  }

  // Image compression to 100px long side, JPEG 60%
  async function compressImageToTinyJpeg(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const longSide = Math.max(width, height);
    const scale = longSide > 100 ? 100 / longSide : 1;
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas not supported");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
        "image/jpeg",
        0.6,
      ),
    );
    const tinyFile = new File(
      [blob],
      file.name.replace(/\.[^.]+$/, "") + "_preview.jpg",
      { type: "image/jpeg" },
    );
    return tinyFile;
  }

  // Handle file selection
  function parseExifDateStringToMs(s: string): number | null {
    // Expected format: YYYY:MM:DD HH:MM:SS
    const re = /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/;
    const m = re.exec(s);
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hour = Number(m[4]);
    const min = Number(m[5]);
    const sec = Number(m[6]);
    const date = new Date(year, month - 1, day, hour, min, sec);
    const ms = date.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  async function extractExifShotTimeMs(file: File): Promise<number | null> {
    // Only attempt for JPEGs; fallback to lastModified for others
    const type = file.type.toLowerCase();
    if (!type.includes("jpeg") && !type.includes("jpg")) return null;
    try {
      const buf = await file.arrayBuffer();
      const view = new DataView(buf);
      // JPEG SOI
      if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
      let offset = 2;
      while (offset + 4 <= view.byteLength) {
        if (view.getUint8(offset) !== 0xff) break;
        const marker = view.getUint8(offset + 1);
        const size = view.getUint16(offset + 2);
        if (marker === 0xe1 && offset + 4 + size <= view.byteLength) {
          // APP1
          const sig = new TextDecoder().decode(
            new Uint8Array(buf, offset + 4, 6),
          );
          if (sig.startsWith("Exif")) {
            const tiffStart = offset + 10; // 4 bytes len + 6 bytes "Exif\0\0"
            if (tiffStart + 8 > view.byteLength) return null;
            const endianMark = new TextDecoder().decode(
              new Uint8Array(buf, tiffStart, 2),
            );
            const little = endianMark === "II";
            const getU16 = (pos: number) => view.getUint16(pos, little);
            const getU32 = (pos: number) => view.getUint32(pos, little);
            const ifd0 = tiffStart + getU32(tiffStart + 4);
            if (ifd0 + 2 > view.byteLength) return null;
            const entries0 = getU16(ifd0);
            let exifIFDPtr: number | null = null;
            let dateTimeStr: string | null = null;

            function readAsciiFromEntry(
              valOffset: number,
              count: number,
            ): string | null {
              // Values are at TIFF base
              const start = tiffStart + valOffset;
              if (start + count <= view.byteLength) {
                const bytes = new Uint8Array(buf, start, count);
                // Trim nulls
                const text = new TextDecoder()
                  .decode(bytes)
                  .replace(/\0+$/, "");
                return text || null;
              }
              return null;
            }

            // IFD0 scan for DateTime (0x0132) and ExifIFD pointer (0x8769)
            for (let i = 0; i < entries0; i++) {
              const pos = ifd0 + 2 + i * 12;
              const tag = getU16(pos);
              const typeId = getU16(pos + 2);
              const count = getU32(pos + 4);
              const value = getU32(pos + 8);
              if (tag === 0x0132 && typeId === 2 && count >= 10 && count < 64) {
                const s = count <= 4 ? null : readAsciiFromEntry(value, count);
                if (s) dateTimeStr = s;
              } else if (tag === 0x8769) {
                exifIFDPtr = tiffStart + value;
              }
            }
            // Prefer ExifIFD DateTimeOriginal (0x9003) or Digitized (0x9004)
            const readExifIFD = (): string | null => {
              if (!exifIFDPtr || exifIFDPtr + 2 > view.byteLength) return null;
              const n = getU16(exifIFDPtr);
              for (let i = 0; i < n; i++) {
                const pos = exifIFDPtr + 2 + i * 12;
                const tag = getU16(pos);
                const typeId = getU16(pos + 2);
                const count = getU32(pos + 4);
                const value = getU32(pos + 8);
                if (
                  (tag === 0x9003 || tag === 0x9004) &&
                  typeId === 2 &&
                  count >= 10 &&
                  count < 64
                ) {
                  const s =
                    count <= 4 ? null : readAsciiFromEntry(value, count);
                  if (s) return s;
                }
              }
              return null;
            };

            const exifDate = readExifIFD();
            const str = exifDate ?? dateTimeStr;
            if (str) return parseExifDateStringToMs(str);
          }
        }
        if (size < 2) break;
        offset += 2 + size;
      }
      return null;
    } catch {
      return null;
    }
  }

  function sortByShotTime(images: SelectedImage[]): SelectedImage[] {
    return [...images].sort(
      (a, b) =>
        (a.shotTimeMs ?? a.file.lastModified) -
        (b.shotTimeMs ?? b.file.lastModified),
    );
  }

  function shuffleImages(images: SelectedImage[]): SelectedImage[] {
    const arr = [...images];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = tmp;
    }
    return arr;
  }

  function applyOrdering(images: SelectedImage[]): SelectedImage[] {
    return orderMode === "chronological"
      ? sortByShotTime(images)
      : shuffleImages(images);
  }

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    void (async () => {
      const newItems: SelectedImage[] = await Promise.all(
        files.map(async (f, i) => {
          const exifMs = await extractExifShotTimeMs(f);
          return {
            id: `${Date.now()}_${i}`,
            file: f,
            previewUrl: URL.createObjectURL(f),
            shotTimeMs: exifMs ?? f.lastModified,
          };
        }),
      );
      if (appendModeRef.current) {
        setSelectedImages((prev) => applyOrdering([...prev, ...newItems]));
      } else {
        selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setSelectedImages(applyOrdering(newItems));
      }
      appendModeRef.current = false;
    })();
  };

  const onRemoveImage = (id: string) => {
    const img = selectedImages.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.previewUrl);
    setSelectedImages((prev) => prev.filter((i) => i.id !== id));
  };

  function removeNPhotos(count: number) {
    setSelectedImages((prev) => {
      const maxRemovable = Math.max(0, prev.length - 2);
      const toRemove = Math.max(0, Math.min(count, maxRemovable));
      if (toRemove <= 0) return prev;
      const removed = prev.slice(-toRemove);
      removed.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      return prev.slice(0, prev.length - toRemove);
    });
  }

  const onClearAll = () => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setSelectedImages([]);
    setCompressedFiles([]);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setPreviewError(null);
  };

  // Compress whenever selectedImages changes
  useEffect(() => {
    let cancelled = false;
    if (!selectedImages.length) {
      setCompressedFiles([]);
      return;
    }
    setIsCompressing(true);
    void (async () => {
      try {
        const tiny = await Promise.all(
          selectedImages.map((si) => compressImageToTinyJpeg(si.file)),
        );
        if (!cancelled) setCompressedFiles(tiny);
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setIsCompressing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedImages]);

  // Build and send preview request
  async function sendPreviewRequest(signal?: AbortSignal): Promise<Blob> {
    // Preview should always be a simple, fast JPEG regardless of selected format
    const outputFormat = "jpeg" as const;
    const isPrint = canvasType === "Print";
    const endpoint = isPrint
      ? "/api/collage/preview"
      : "/api/collage/preview-pixels";

    const fd = new FormData();
    // Files
    const filesToSend = compressedFiles.length
      ? compressedFiles
      : selectedImages.map((s) => s.file);
    filesToSend.forEach((f) => fd.append("files", f));

    // Dimensions
    let widthVal: number | null = null;
    let heightVal: number | null = null;

    if (sizePreset !== "Custom Dimensions") {
      const parsed = parseDimensionsFromPreset(sizePreset, canvasType);
      widthVal = parsed.width;
      heightVal = parsed.height;
    } else {
      const w = getNumericCustom(customWidth);
      const h = getNumericCustom(customHeight);
      widthVal = w;
      heightVal = h;
    }

    if (isPrint) {
      if (widthVal != null) fd.append("width_mm", String(widthVal));
      if (heightVal != null) fd.append("height_mm", String(heightVal));
      const dpi = parseDpiFromResolution(resolution);
      fd.append("dpi", String(dpi));
    } else {
      if (widthVal != null) fd.append("width_px", String(Math.round(widthVal)));
      if (heightVal != null)
        fd.append("height_px", String(Math.round(heightVal)));
      fd.append("dpi", String(96));
    }

    // Other params
    fd.append("layout_style", layout === "Masonry" ? "masonry" : "grid");
    // Convert fraction (0.0-0.3) to percent with 2 decimals, clamp 0-100
    const spacingPercent = Math.max(
      0,
      Math.min(100, Math.round(spacing * 10000) / 100),
    );
    fd.append("spacing", String(spacingPercent));
    const bg = "#FFFFFF";
    fd.append("background_color", bg);
    fd.append("maintain_aspect_ratio", String(maintainAspect));
    fd.append("apply_shadow", String(false));
    fd.append("output_format", outputFormat);
    fd.append("pretrim_borders", String(false));
    fd.append("face_aware_cropping", String(false));
    fd.append("face_margin", String(0.08));

    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      body: fd,
      signal,
      headers: {
        // Let browser set Content-Type for FormData
        "Cache-Control": "no-store",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Preview failed with ${res.status}`);
    }
    return await res.blob();
  }

  function requestPreviewDebounced() {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // Do not call preview unless we have both width and height
    let widthVal: number | null = null;
    let heightVal: number | null = null;
    if (sizePreset !== "Custom Dimensions") {
      const parsed = parseDimensionsFromPreset(sizePreset, canvasType);
      widthVal = parsed.width;
      heightVal = parsed.height;
    } else {
      const w = getNumericCustom(customWidth);
      const h = getNumericCustom(customHeight);
      widthVal = w;
      heightVal = h;
    }
    if (widthVal == null || heightVal == null) return;

    debounceTimerRef.current = setTimeout(() => {
      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsLoadingPreview(true);
      setPreviewError(null);
      void (async () => {
        try {
          const blob = await sendPreviewRequest(controller.signal);
          const objUrl = URL.createObjectURL(blob);
          setPreviewUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return objUrl;
          });
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setPreviewError(
            err instanceof Error ? err.message : "Preview failed",
          );
        } finally {
          setIsLoadingPreview(false);
        }
      })();
    }, 400);
  }

  // Trigger preview on layout/dim changes
  useEffect(() => {
    if (selectedImages.length < 2) return; // wait until we have >= 2 files
    requestPreviewDebounced();
  }, [
    layout,
    canvasType,
    sizePreset,
    customWidth,
    customHeight,
    format,
    transparency,
    maintainAspect,
    spacing,
    compressedFiles,
  ]);

  // Compute width/height in millimeters for Optimize Grid
  function computeCanvasMm(): {
    widthMm: number | null;
    heightMm: number | null;
    dpiVal: number;
  } {
    const isPrint = canvasType === "Print";
    let widthVal: number | null = null;
    let heightVal: number | null = null;
    if (sizePreset !== "Custom Dimensions") {
      const parsed = parseDimensionsFromPreset(sizePreset, canvasType);
      widthVal = parsed.width;
      heightVal = parsed.height;
    } else {
      widthVal = getNumericCustom(customWidth);
      heightVal = getNumericCustom(customHeight);
    }
    if (isPrint) {
      const dpiVal = parseDpiFromResolution(resolution);
      return { widthMm: widthVal, heightMm: heightVal, dpiVal };
    } else {
      // Convert px to mm using DPI (screen ~96)
      const dpiVal = 96;
      const pxToMm = (px: number | null) =>
        px == null ? null : (px * 25.4) / dpiVal;
      return { widthMm: pxToMm(widthVal), heightMm: pxToMm(heightVal), dpiVal };
    }
  }

  // Call Optimize Grid endpoint (debounced)
  async function sendOptimizeGridRequest(signal?: AbortSignal): Promise<{
    columns: number | null;
    rows: number | null;
    optimalNumImages: number | null;
    delta: number | null;
  }> {
    const { widthMm, heightMm, dpiVal } = computeCanvasMm();
    if (widthMm == null || heightMm == null) {
      return { columns: null, rows: null, optimalNumImages: null, delta: null };
    }
    const spacingPercent = Math.max(
      0,
      Math.min(100, Math.round(spacing * 10000) / 100),
    );
    const fd = new FormData();
    fd.append(
      "num_images",
      String(Math.max(0, Math.floor(selectedImages.length))),
    );
    fd.append("width_mm", String(widthMm));
    fd.append("height_mm", String(heightMm));
    fd.append("dpi", String(dpiVal));
    fd.append("spacing", String(spacingPercent));
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const url = `${baseUrl}/api/collage/optimize-grid`;
    const res = await fetch(url, { method: "POST", body: fd, signal });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Optimize grid failed with ${res.status}`);
    }
    const json = (await res.json()) as {
      success?: boolean;
      optimization?: {
        current_grid: {
          total_images: number | string;
          cols: number | string;
          rows: number | string;
          images_in_last_row: number | string;
          is_perfect: boolean;
        };
        closest_perfect_grid: null | {
          type: "perfect" | "add_images" | "remove_images";
          total_images?: number | string;
          cols?: number | string;
          rows?: number | string;
          images_needed?: number | string;
          images_to_remove?: number | string;
        };
        recommendations: {
          add_images: Array<{
            images_needed: number | string;
            total_images: number | string;
            cols: number | string;
            rows: number | string;
          }>;
          remove_images: Array<{
            images_to_remove: number | string;
            total_images: number | string;
            cols: number | string;
            rows: number | string;
          }>;
        };
        canvas_info: {
          width: number | string;
          height: number | string;
          spacing: number | string;
        };
      };
      message?: string;
    };

    const toNum = (v: unknown): number | null => {
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const opt = json.optimization;
    if (!opt)
      return { columns: null, rows: null, optimalNumImages: null, delta: null };

    // Prefer closest perfect grid if provided
    const closest = opt.closest_perfect_grid;
    if (closest) {
      const columns =
        toNum(closest.cols) ?? toNum(opt.current_grid.cols) ?? null;
      const rows = toNum(closest.rows) ?? toNum(opt.current_grid.rows) ?? null;
      const optimalNumImages =
        toNum(closest.total_images) ??
        (columns != null && rows != null ? columns * rows : null);
      let delta: number | null = null;
      if (closest.type === "add_images")
        delta = toNum(closest.images_needed) ?? null;
      else if (closest.type === "remove_images")
        delta = -(toNum(closest.images_to_remove) ?? 0);
      else if (closest.type === "perfect") delta = 0;
      return { columns, rows, optimalNumImages, delta };
    }

    // Otherwise select the best recommendation (smallest absolute change)
    const adds = opt.recommendations?.add_images ?? [];
    const removes = opt.recommendations?.remove_images ?? [];

    let best: {
      cols: number;
      rows: number;
      total: number;
      delta: number;
    } | null = null;

    for (const rec of adds) {
      const cols = toNum(rec.cols);
      const rows = toNum(rec.rows);
      const total = toNum(rec.total_images);
      const need = toNum(rec.images_needed);
      if (cols != null && rows != null && total != null && need != null) {
        const candidate = { cols, rows, total, delta: need };
        if (!best || Math.abs(candidate.delta) < Math.abs(best.delta))
          best = candidate;
      }
    }
    for (const rec of removes) {
      const cols = toNum(rec.cols);
      const rows = toNum(rec.rows);
      const total = toNum(rec.total_images);
      const rm = toNum(rec.images_to_remove);
      if (cols != null && rows != null && total != null && rm != null) {
        const candidate = { cols, rows, total, delta: -rm };
        if (!best || Math.abs(candidate.delta) < Math.abs(best.delta))
          best = candidate;
      }
    }

    if (best) {
      return {
        columns: best.cols,
        rows: best.rows,
        optimalNumImages: best.total,
        delta: best.delta,
      };
    }

    // Fallback to current grid info
    const cols = toNum(opt.current_grid.cols);
    const rows = toNum(opt.current_grid.rows);
    const total = toNum(opt.current_grid.total_images);
    const deltaFallback = opt.current_grid.is_perfect ? 0 : null;
    return {
      columns: cols,
      rows: rows,
      optimalNumImages: total,
      delta: deltaFallback,
    };
  }

  function requestOptimizeGridDebounced() {
    if (optimizeDebounceRef.current) clearTimeout(optimizeDebounceRef.current);
    optimizeDebounceRef.current = setTimeout(() => {
      if (optimizeAbortRef.current) optimizeAbortRef.current.abort();
      const controller = new AbortController();
      optimizeAbortRef.current = controller;
      setIsOptimizingGrid(true);
      setOptimizeGridError(null);
      void (async () => {
        try {
          const result = await sendOptimizeGridRequest(controller.signal);
          setGridAdvice(result);
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setOptimizeGridError(
            err instanceof Error ? err.message : "Optimize grid failed",
          );
        } finally {
          setIsOptimizingGrid(false);
        }
      })();
    }, 400);
  }

  // Trigger optimize-grid only for Grid layout
  useEffect(() => {
    if (layout !== "Grid") return;
    if (selectedImages.length < 2) return;
    requestOptimizeGridDebounced();
  }, [
    layout,
    selectedImages.length,
    canvasType,
    sizePreset,
    customWidth,
    customHeight,
    resolution,
    spacing,
  ]);

  // Cancel any in-flight job polling if user changes key settings
  useEffect(() => {
    if (jobAbortRef.current) jobAbortRef.current.abort();
    setIsCreatingJob(false);
    setJobStatus(null);
    setJobProgress(0);
    setDownloadError(null);
  }, [
    layout,
    canvasType,
    sizePreset,
    customWidth,
    customHeight,
    format,
    transparency,
    maintainAspect,
    spacing,
    selectedImages,
  ]);

  function buildCommonFormDataForCreate(isPrint: boolean): FormData {
    const output = getOutputFormat();
    const fd = new FormData();
    // Use original files for final render
    selectedImages.forEach((s) => fd.append("files", s.file));

    // Dimensions
    let widthVal: number | null = null;
    let heightVal: number | null = null;
    if (sizePreset !== "Custom Dimensions") {
      const parsed = parseDimensionsFromPreset(sizePreset, canvasType);
      widthVal = parsed.width;
      heightVal = parsed.height;
    } else {
      widthVal = getNumericCustom(customWidth);
      heightVal = getNumericCustom(customHeight);
    }

    if (isPrint) {
      if (widthVal != null) fd.append("width_mm", String(widthVal));
      if (heightVal != null) fd.append("height_mm", String(heightVal));
      const dpi = parseDpiFromResolution(resolution);
      fd.append("dpi", String(dpi));
    } else {
      if (widthVal != null) fd.append("width_px", String(Math.round(widthVal)));
      if (heightVal != null)
        fd.append("height_px", String(Math.round(heightVal)));
      fd.append("dpi", String(96));
    }

    // Other params
    fd.append("layout_style", layout === "Masonry" ? "masonry" : "grid");
    const spacingPercent = Math.max(
      0,
      Math.min(100, Math.round(spacing * 10000) / 100),
    );
    fd.append("spacing", String(spacingPercent));
    const bg = output === "png" && transparency ? "#00000000" : "#FFFFFF";
    fd.append("background_color", bg);
    fd.append("maintain_aspect_ratio", String(maintainAspect));
    fd.append("apply_shadow", String(false));
    fd.append("output_format", output);
    fd.append("pretrim_borders", String(false));
    fd.append("face_aware_cropping", String(false));
    fd.append("face_margin", String(0.08));
    return fd;
  }

  function suggestedFilename(): string {
    const ext =
      getOutputFormat() === "png"
        ? "png"
        : getOutputFormat() === "tiff"
          ? "tiff"
          : "jpg";
    return `photoweave-collage.${ext}`;
  }

  function triggerDownload(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = suggestedFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleDownload(): Promise<void> {
    if (selectedImages.length < 2 || isCreatingJob) return;
    setIsCreatingJob(true);
    setDownloadError(null);
    setJobProgress(0);
    setJobStatus("pending");

    // Abort any existing job
    if (jobAbortRef.current) jobAbortRef.current.abort();
    const controller = new AbortController();
    jobAbortRef.current = controller;

    const isPrint = canvasType === "Print";
    const createEndpoint = isPrint
      ? "/api/collage/create"
      : "/api/collage/create-pixels";
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const createUrl = `${baseUrl}${createEndpoint}`;

    try {
      const fd = buildCommonFormDataForCreate(isPrint);
      const createRes = await fetch(createUrl, {
        method: "POST",
        body: fd,
        signal: controller.signal,
      });
      if (!createRes.ok) {
        const text = await createRes.text().catch(() => "");
        throw new Error(text || `Create failed with ${createRes.status}`);
      }
      const dataUnknown = (await createRes.json()) as unknown;
      const data = CreateCollageResponseSchema.parse(dataUnknown);
      setJobStatus(data.status);

      // Poll status
      const statusUrl = `${baseUrl}/api/collage/status/${data.job_id}`;
      while (true) {
        if (controller.signal.aborted)
          throw new DOMException("Aborted", "AbortError");
        const sRes = await fetch(statusUrl, { signal: controller.signal });
        if (!sRes.ok) {
          const t = await sRes.text().catch(() => "");
          throw new Error(t || `Status failed with ${sRes.status}`);
        }
        const sUnknown = (await sRes.json()) as unknown;
        const sJson = CollageStatusMinimalSchema.parse(sUnknown);
        setJobStatus(sJson.status);
        setJobProgress(typeof sJson.progress === "number" ? sJson.progress : 0);
        if (sJson.status === "completed") break;
        if (sJson.status === "failed")
          throw new Error(sJson.error_message ?? "Collage rendering failed");
        await new Promise((r) => setTimeout(r, 800));
      }

      // Download
      const downloadUrl = `${baseUrl}/api/collage/download/${data.job_id}`;
      const dRes = await fetch(downloadUrl, { signal: controller.signal });
      if (!dRes.ok) {
        const t = await dRes.text().catch(() => "");
        throw new Error(t || `Download failed with ${dRes.status}`);
      }
      const blob = await dRes.blob();
      triggerDownload(blob);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setIsCreatingJob(false);
    }
  }

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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onPickFiles}
              />
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-full bg-[color:var(--theme-primary)]/80 px-6 py-3 text-lg font-semibold text-white transition hover:bg-[color:var(--theme-primary)]"
              onClick={() => {
                appendModeRef.current = false;
                if (fileInputRef.current) fileInputRef.current.value = "";
                fileInputRef.current?.click();
              }}
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
              {isCompressing && <p className="mt-1">Optimizing previews…</p>}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {selectedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative h-20 w-full overflow-hidden rounded-md bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]"
                >
                  <img
                    src={img.previewUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove"
                    className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/80"
                    onClick={() => onRemoveImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-current/20 px-6 py-3 text-base"
              onClick={onClearAll}
            >
              <span className="mr-2">×</span>Clear All
            </button>
          </div>

          {/* Middle: Preview */}
          <div>
            <h2 className="font-display mb-4 text-2xl md:text-3xl">
              Collage Preview
            </h2>
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_65%,transparent)] backdrop-blur-md">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Collage preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="opacity-60">Preview</span>
              )}
            </div>
            <div className="mt-4 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span>
                  Status:{" "}
                  {isLoadingPreview
                    ? "Loading"
                    : previewError
                      ? "Error"
                      : previewUrl
                        ? "Ready"
                        : "Idle"}
                </span>
                {jobStatus && (
                  <span className="text-xs opacity-70">
                    Render: {jobStatus}
                    {typeof jobProgress === "number" && jobProgress > 0
                      ? ` (${jobProgress}%)`
                      : ""}
                  </span>
                )}
              </div>
              {layout === "Grid" && (
                <div className="mb-3 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-3 text-sm shadow-sm">
                  {isOptimizingGrid ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[color:var(--theme-accent)]" />
                      <span>Optimizing grid…</span>
                    </div>
                  ) : optimizeGridError ? (
                    <span className="text-red-500">{optimizeGridError}</span>
                  ) : gridAdvice.optimalNumImages != null ? (
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-medium">
                          Ideal grid: {gridAdvice.columns ?? "?"} ×{" "}
                          {gridAdvice.rows ?? "?"}
                        </div>
                        <div className="opacity-80">
                          Target photos: {gridAdvice.optimalNumImages}
                        </div>
                      </div>
                      {gridAdvice.delta != null && gridAdvice.delta !== 0 ? (
                        <div className="flex items-center gap-3">
                          {gridAdvice.delta > 0 ? (
                            <>
                              <span>
                                Add {gridAdvice.delta} photo(s) for a perfect
                                grid.
                              </span>
                              <button
                                type="button"
                                className="rounded-full border border-current/20 px-4 py-2 text-xs"
                                onClick={() => {
                                  appendModeRef.current = true;
                                  if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                                  fileInputRef.current?.click();
                                }}
                              >
                                Add Photos
                              </button>
                            </>
                          ) : (
                            <>
                              <span>
                                Remove {Math.abs(gridAdvice.delta)} photo(s) for
                                a perfect grid.
                              </span>
                              <button
                                type="button"
                                className="rounded-full bg-[color:var(--theme-accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                                onClick={() =>
                                  removeNPhotos(Math.abs(gridAdvice.delta ?? 0))
                                }
                              >
                                Remove {Math.abs(gridAdvice.delta)}
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-500">
                          You&apos;re already at a perfect grid.
                        </span>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              <div className="h-2 w-full rounded-full bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]">
                <div
                  className="h-2 rounded-full bg-[color:var(--theme-accent)] transition-all"
                  style={{
                    width: isLoadingPreview
                      ? "40%"
                      : previewUrl
                        ? "100%"
                        : "0%",
                  }}
                ></div>
              </div>
              {previewError && (
                <p className="mt-2 text-red-500">{previewError}</p>
              )}
              {downloadError && (
                <p className="mt-2 text-red-500">{downloadError}</p>
              )}
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                className="rounded-full border border-current/20 px-6 py-3 text-base disabled:opacity-60"
                disabled={!selectedImages.length}
                onClick={() => requestPreviewDebounced()}
              >
                Preview
              </button>
              <button
                type="button"
                className="rounded-full bg-[color:var(--theme-accent)] px-6 py-3 text-base font-semibold text-white hover:opacity-90 disabled:opacity-60"
                disabled={selectedImages.length < 2 || isCreatingJob}
                onClick={() => void handleDownload()}
              >
                {isCreatingJob ? "Rendering…" : "Download"}
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

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm opacity-80">Spacing</span>
                  <span className="text-xs opacity-60">
                    {Math.round(spacing * 10000) / 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.3}
                  step={0.01}
                  value={spacing}
                  onChange={(e) => setSpacing(parseFloat(e.target.value))}
                  className="w-full"
                />
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

              <div className="mt-4 rounded-xl border border-[color:color-mix(in_oklch,var(--theme-text)_18%,transparent)] bg-[color:color-mix(in_oklch,var(--theme-background)_72%,transparent)] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm opacity-80">Order Images</span>
                  <span className="text-xs opacity-60">
                    {orderMode === "chronological" ? "Chronological" : "Random"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImages((prev) => {
                        setOrderMode("chronological");
                        return sortByShotTime(prev);
                      })
                    }
                    className={[
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm",
                      orderMode === "chronological"
                        ? "border-[color:var(--theme-accent)]"
                        : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                      "bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] backdrop-blur-sm",
                    ].join(" ")}
                  >
                    <span>🕒</span>
                    <span>Chronologically</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImages((prev) => {
                        setOrderMode("random");
                        return shuffleImages(prev);
                      })
                    }
                    className={[
                      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm",
                      orderMode === "random"
                        ? "border-[color:var(--theme-accent)]"
                        : "border-[color:color-mix(in_oklch,var(--theme-text)_20%,transparent)]",
                      "bg-[color:color-mix(in_oklch,var(--theme-background)_70%,transparent)] backdrop-blur-sm",
                    ].join(" ")}
                  >
                    <span>🎲</span>
                    <span>Random</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
