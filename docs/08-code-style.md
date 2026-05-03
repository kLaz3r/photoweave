# PhotoWeave Code Style Guide

This guide covers the coding conventions, TypeScript patterns, and best practices used in PhotoWeave.

## TypeScript Conventions

### Type Definitions

Use explicit type definitions for all functions and components:

```typescript
// Good
export function calculateSpacing(
  canvasSize: number,
  spacingPercent: number,
): number {
  return (canvasSize * spacingPercent) / 100;
}

// Bad
export function calculateSpacing(canvasSize, spacingPercent) {
  return (canvasSize * spacingPercent) / 100;
}
```

### Interface vs Type

Use `interface` for object shapes that may be extended:

```typescript
// Good for extensible objects
export interface CollageConfig {
  widthPx: number;
  heightPx: number;
  layoutStyle: LayoutStyle;
}

// Good for unions and primitives
export type LayoutStyle = "masonry" | "grid";
export type OutputFormat = "jpeg" | "png";
```

### Type Imports

Use type-only imports for types:

```typescript
// Good
import type { CollageConfig } from "./config";
import { DEFAULT_COLLAGE_CONFIG } from "./config";

// Bad
import { CollageConfig, DEFAULT_COLLAGE_CONFIG } from "./config";
```

### Type Guards

Use type guards for runtime type checking:

```typescript
// Good
function isLoadedImage(value: unknown): value is LoadedImage {
  return (
    typeof value === "object" &&
    value !== null &&
    "bitmap" in value &&
    "width" in value &&
    "height" in value
  );
}

// Usage
if (isLoadedImage(data)) {
  // TypeScript knows data is LoadedImage
  console.log(data.width);
}
```

## React Patterns

### Component Structure

Organize components with clear sections:

```tsx
// Good
export function CollagePage() {
  // 1. Hooks
  const { images, config, addImages, exportCollage } = useCollage();
  const { isLoading } = useFaceDetector();

  // 2. Event handlers
  const handleExport = useCallback(() => {
    exportCollage();
  }, [exportCollage]);

  // 3. Derived values
  const hasImages = images.length > 0;

  // 4. Render
  return <main>{/* JSX */}</main>;
}
```

### Custom Hooks

Create custom hooks for reusable logic:

```typescript
// Good
export function useCollage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [config, setConfig] = useState<CollageConfig>(DEFAULT_COLLAGE_CONFIG);

  const addImages = useCallback((files: File[]) => {
    // Implementation
  }, []);

  return { images, config, addImages };
}

// Usage
const { images, addImages } = useCollage();
```

### useCallback and useMemo

Use `useCallback` for event handlers and `useMemo` for expensive computations:

```tsx
// Good
const handleExport = useCallback(() => {
  exportCollage();
}, [exportCollage]);

const sortedImages = useMemo(
  () => images.sort((a, b) => a.timestamp - b.timestamp),
  [images],
);

// Bad
const handleExport = () => {
  exportCollage();
};

const sortedImages = images.sort((a, b) => a.timestamp - b.timestamp);
```

### Component Props

Define props with TypeScript:

```tsx
// Good
interface ImageUploaderProps {
  images: Thumbnail[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ImageUploader({
  images,
  onFiles,
  onRemove,
  onClear,
}: ImageUploaderProps) {
  // Implementation
}

// Usage
<ImageUploader
  images={thumbnails}
  onFiles={addImages}
  onRemove={removeImage}
  onClear={clearImages}
/>;
```

## Naming Conventions

### Files and Directories

- Use kebab-case for files: `image-uploader.tsx`
- Use PascalCase for components: `ImageUploader.tsx`
- Use camelCase for utilities: `format-date.ts`

### Variables and Functions

- Use camelCase for variables and functions: `calculateSpacing`, `imageCount`
- Use PascalCase for components: `CollagePage`, `ImageUploader`
- Use UPPER_CASE for constants: `DEFAULT_COLLAGE_CONFIG`, `MAX_IMAGE_SIZE`

### Interfaces and Types

- Use PascalCase for interfaces and types: `CollageConfig`, `LayoutStyle`
- Prefix interfaces with descriptive names: `LoadedImage`, `ImageBlock`

## Code Organization

### Imports

Organize imports in this order:

```typescript
// 1. React and Next.js
import { useState, useCallback } from "react";
import Image from "next/image";

// 2. Third-party libraries
import { motion } from "framer-motion";
import { z } from "zod";

// 3. Internal imports (type-only)
import type { CollageConfig } from "./config";

// 4. Internal imports (values)
import { DEFAULT_COLLAGE_CONFIG } from "./config";
import { useCollage } from "~/hooks/useCollage";
```

### File Structure

Organize files by feature:

```
src/
├── components/
│   ├── collage/
│   │   ├── ImageUploader.tsx
│   │   ├── CollageCanvas.tsx
│   │   └── ConfigPanel.tsx
│   └── ui/
│       └── Button.tsx
├── hooks/
│   ├── useCollage.ts
│   └── useFaceDetector.ts
└── lib/
    ├── collage/
    │   ├── layouts/
    │   │   ├── grid.ts
    │   │   └── masonry.ts
    │   └── config.ts
    └── theme.ts
```

## Best Practices

### Error Handling

Handle errors gracefully:

```typescript
// Good
export async function loadFaceDetector(): Promise<FaceDetector> {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
    );
    return await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/blaze_face_short_range.tflite",
      },
    });
  } catch (error) {
    console.error("Failed to load face detector:", error);
    throw new Error("Face detection unavailable");
  }
}

// Bad
export async function loadFaceDetector(): Promise<FaceDetector> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );
  return await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/blaze_face_short_range.tflite",
    },
  });
}
```

### Async/Await

Use async/await for asynchronous code:

```typescript
// Good
export async function generateCollage(
  images: LoadedImage[],
  config: CollageConfig,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = config.widthPx;
  canvas.height = config.heightPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  for (const image of images) {
    await drawImage(ctx, image);
  }

  return canvas;
}

// Bad
export function generateCollage(
  images: LoadedImage[],
  config: CollageConfig,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = config.widthPx;
  canvas.height = config.heightPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  images.forEach((image) => {
    drawImage(ctx, image).then(() => {});
  });

  return Promise.resolve(canvas);
}
```

### Null Checks

Use optional chaining and nullish coalescing:

```typescript
// Good
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Failed to get canvas context");

const width = config.widthPx ?? 1920;
const height = config.heightPx ?? 1080;

// Bad
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const width = config.widthPx || 1920;
const height = config.heightPx || 1080;
```

### Constants

Extract magic numbers to constants:

```typescript
// Good
const PREVIEW_DEBOUNCE_MS = 300;
const MAX_PREVIEW_SIZE = 500;
const DEFAULT_SPACING = 40;

useEffect(() => {
  const timer = setTimeout(() => {
    generatePreview();
  }, PREVIEW_DEBOUNCE_MS);

  return () => clearTimeout(timer);
}, [images, config]);

// Bad
useEffect(() => {
  const timer = setTimeout(() => {
    generatePreview();
  }, 300);

  return () => clearTimeout(timer);
}, [images, config]);
```

## Comments

### When to Comment

Add comments for:

- Complex algorithms
- Non-obvious business logic
- Workarounds for bugs
- TODOs and FIXMEs

```typescript
// Good
// Calculate optimal column count for masonry layout
// by evaluating aspect penalty and unevenness
function findOptimalColumns(
  images: LoadedImage[],
  canvasWidth: number,
  canvasHeight: number,
): number {
  // Implementation
}

// Bad
// This function finds the optimal columns
function findOptimalColumns(
  images: LoadedImage[],
  canvasWidth: number,
  canvasHeight: number,
): number {
  // Implementation
}
```

## Next Steps

- Read the [Development Guide](./07-development-guide.md) for development workflows
- Check the [Architecture Documentation](./03-architecture.md) to understand the codebase
- Review the [Contributing Guide](./16-contributing.md) for contribution guidelines
