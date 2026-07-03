"use client";

import Image from "next/image";
import { memo, useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  type DragEndEvent,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ImageUploaderProps {
  images: Array<{ previewUrl: string; id: string }>;
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onShuffle: () => void;
  onSortChronologically: () => void;
  onReorder: (from: number, to: number) => void;
}

function SortableThumbnail({
  id,
  previewUrl,
  onRemove,
}: {
  id: string;
  previewUrl: string;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square overflow-hidden rounded-md bg-[color:color-mix(in_oklch,var(--theme-text)_12%,transparent)]"
    >
      <button
        type="button"
        className="absolute top-0 left-0 z-10 flex h-5 w-5 items-center justify-center rounded-br-md bg-black/50 text-white/60 transition hover:text-white/90"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="8" cy="4" r="2" />
          <circle cx="16" cy="4" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="16" cy="12" r="2" />
          <circle cx="8" cy="20" r="2" />
          <circle cx="16" cy="20" r="2" />
        </svg>
      </button>
      <Image
        src={previewUrl}
        alt="preview"
        fill
        sizes="80px"
        className="object-cover"
        unoptimized
      />
      <button
        type="button"
        aria-label={`Remove image ${id}`}
        className="absolute top-1 right-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs text-white hover:bg-black/90"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        &times;
      </button>
    </div>
  );
}

export const ImageUploader = memo(function ImageUploader({
  images,
  onFiles,
  onRemove,
  onClear,
  onShuffle,
  onSortChronologically,
  onReorder,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const appendModeRef = useRef(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFiles(acceptedFiles);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".bmp",
        ".webp",
        ".tiff",
        ".tif",
      ],
    },
    minSize: 0,
  });

  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  const handlePickAndReplace = () => {
    appendModeRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const handlePickAndAppend = () => {
    appendModeRef.current = true;
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(oldIndex, newIndex);
    },
    [images, onReorder],
  );

  const totalMB = images.length > 0 ? images.length * 0.5 : 0;
  const sortableIds = images.map((img) => img.id);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-xl sm:text-2xl md:text-3xl">File Upload</h2>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={[
          "flex min-h-40 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors",
          isDragActive
            ? "border-[color:var(--theme-primary)] bg-[color:var(--theme-primary)]/10"
            : "border-[color:color-mix(in_oklch,var(--theme-text)_25%,transparent)]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handlePickFiles}
        />
        <input {...getInputProps()} />
        <span className="text-center text-lg opacity-80">
          {isDragActive ? (
            <>Drop photos here</>
          ) : (
            <>
              Drag & Drop
              <br />
              Photos Here
            </>
          )}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-full rounded-full bg-[color:var(--theme-primary)]/80 px-6 py-3 text-lg font-semibold text-white transition hover:bg-[color:var(--theme-primary)]"
          onClick={handlePickAndReplace}
        >
          Choose Files
        </button>
        <button
          type="button"
          className="w-full rounded-full border border-current/20 px-6 py-2 text-base transition hover:bg-white/5"
          onClick={handlePickAndAppend}
        >
          + Add More Photos
        </button>
      </div>

      {/* Stats */}
      <div className="text-sm opacity-70">
        <p>{images.length} Files</p>
        <p>~{totalMB.toFixed(0)} MB</p>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-60">Image Order</span>
            <div className="flex flex-1 gap-2">
              <button
                type="button"
                aria-label="Random order"
                title="Shuffle images in random order"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/15 px-3 py-2 text-xs font-medium transition hover:bg-white/5 focus:ring-1 focus:ring-[color:var(--theme-accent)]"
                onClick={onShuffle}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
                Random
              </button>
              <button
                type="button"
                aria-label="Chronological order"
                title="Sort images by date taken"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-current/15 px-3 py-2 text-xs font-medium transition hover:bg-white/5 focus:ring-1 focus:ring-[color:var(--theme-accent)]"
                onClick={onSortChronologically}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="15" y2="18" />
                </svg>
                By Date
              </button>
            </div>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                {images.map((img) => (
                  <SortableThumbnail
                    key={img.id}
                    id={img.id}
                    previewUrl={img.previewUrl}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-col gap-2">
          {confirmClear ? (
            <div className="flex flex-col gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">
                Remove all {images.length} photos?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-red-500/20 px-4 py-1.5 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
                  onClick={() => {
                    onClear();
                    setConfirmClear(false);
                  }}
                >
                  Yes, Clear All
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-full border border-current/20 px-4 py-1.5 text-sm transition hover:bg-white/5"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="w-full rounded-full border border-current/20 px-6 py-2 text-base"
              onClick={() => setConfirmClear(true)}
            >
              &times; Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
});
