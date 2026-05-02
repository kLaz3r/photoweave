"use client";

interface ExportButtonProps {
  imageCount: number;
  isGenerating: boolean;
  outputFormat: "jpeg" | "png";
  onExport: () => void;
}

export function ExportButton({
  imageCount,
  isGenerating,
  onExport,
}: ExportButtonProps) {
  const disabled = imageCount < 2 || isGenerating;

  return (
    <button
      type="button"
      className={[
        "rounded-full px-8 py-3 text-lg font-semibold transition",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "bg-[color:var(--theme-accent)] text-white hover:opacity-90",
      ].join(" ")}
      disabled={disabled}
      onClick={onExport}
    >
      {isGenerating ? "Exporting…" : "Download Collage"}
    </button>
  );
}