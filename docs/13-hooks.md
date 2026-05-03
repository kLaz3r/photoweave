# PhotoWeave Hooks Reference

This guide covers the custom React hooks used in PhotoWeave.

## Overview

PhotoWeave uses custom hooks to encapsulate stateful logic and promote code reuse.

## Available Hooks

### useCollage

The `useCollage` hook is the central state management for the collage editor.

**Signature:**

```typescript
function useCollage(): CollageState;
```

**Returns:**

```typescript
interface CollageState {
  // Images
  images: LoadedImage[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;
  clearImages: () => void;
  shuffleImages: () => void;
  sortImagesChronologically: () => void;

  // Configuration
  config: CollageConfig;
  setConfig: (config: Partial<CollageConfig>) => void;

  // Preview
  previewCanvas: HTMLCanvasElement | null;
  isGenerating: boolean;
  progress: number;

  // Grid info
  gridInfo: GridInfo | null;

  // Export
  exportCollage: () => Promise<void>;
}
```

**Usage:**

```tsx
export default function CollagePage() {
  const {
    images,
    config,
    setConfig,
    previewCanvas,
    isGenerating,
    progress,
    gridInfo,
    addImages,
    removeImage,
    clearImages,
    shuffleImages,
    sortImagesChronologically,
    exportCollage,
  } = useCollage();

  return <main>{/* Use state and methods */}</main>;
}
```

**Features:**

- Image management (add, remove, shuffle, sort)
- Configuration management
- Preview generation with debouncing
- Grid optimization calculation
- Export with progress tracking

**Implementation Details:**

```typescript
// src/hooks/useCollage.ts

export function useCollage() {
  // State
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [config, setConfig] = useState<CollageConfig>(DEFAULT_COLLAGE_CONFIG);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gridInfo, setGridInfo] = useState<GridInfo | null>(null);

  // Debounced preview generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview();
    }, 300);

    return () => clearTimeout(timer);
  }, [images, config]);

  // Grid info calculation
  useEffect(() => {
    if (config.layoutStyle === "grid" && images.length >= 2) {
      const info = calculateOptimalGrid(
        images.length,
        config.widthPx,
        config.heightPx,
        spacingPixels(config.widthPx, config.heightPx, config.spacing),
      );
      setGridInfo(info);
    } else {
      setGridInfo(null);
    }
  }, [images.length, config]);

  // Add images
  const addImages = useCallback(async (files: File[]) => {
    const newImages = await loadImagesAsBitmaps(files);
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      prev[index].bitmap.close();
      return newImages;
    });
  }, []);

  // Clear images
  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => img.bitmap.close());
      return [];
    });
  }, []);

  // Shuffle images
  const shuffleImages = useCallback(() => {
    setImages((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  // Sort chronologically
  const sortImagesChronologically = useCallback(async () => {
    setImages((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const timeA = a.file.lastModified;
        const timeB = b.file.lastModified;
        return timeA - timeB;
      });
      return sorted;
    });
  }, []);

  // Export collage
  const exportCollage = useCallback(async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const canvas = await generateCollageWithWorker(images, config, (p) => {
        setProgress(p);
      });

      downloadCanvas(canvas, config.outputFormat, "collage");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [images, config]);

  return {
    images,
    config,
    setConfig,
    previewCanvas,
    isGenerating,
    progress,
    gridInfo,
    addImages,
    removeImage,
    clearImages,
    shuffleImages,
    sortImagesChronologically,
    exportCollage,
  };
}
```

### useFaceDetector

The `useFaceDetector` hook manages MediaPipe face detector loading.

**Signature:**

```typescript
function useFaceDetector(): FaceDetectorState;
```

**Returns:**

```typescript
interface FaceDetectorState {
  isLoading: boolean;
  isReady: boolean;
  ensureLoaded: () => Promise<void>;
}
```

**Usage:**

```tsx
export default function ConfigPanel() {
  const { isLoading, isReady, ensureLoaded } = useFaceDetector();

  const handleToggleFaceDetection = async () => {
    await ensureLoaded();
    setConfig({ ...config, faceAwareCropping: true });
  };

  return (
    <button onClick={handleToggleFaceDetection}>
      {isLoading ? "Loading..." : "Enable Face Detection"}
    </button>
  );
}
```

**Features:**

- Lazy loading of MediaPipe
- Loading state tracking
- Ready state tracking
- Ensure loaded function

**Implementation Details:**

```typescript
// src/hooks/useFaceDetector.ts

import { useState, useCallback } from "react";
import { loadFaceDetector } from "~/lib/collage/face-detection";

export function useFaceDetector() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const ensureLoaded = useCallback(async () => {
    if (isReady) return;

    setIsLoading(true);
    try {
      await loadFaceDetector();
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  return {
    isLoading,
    isReady,
    ensureLoaded,
  };
}
```

## Hook Patterns

### State Management

Hooks use `useState` for local state:

```typescript
const [images, setImages] = useState<LoadedImage[]>([]);
```

### Memoization

Hooks use `useCallback` for event handlers:

```typescript
const addImages = useCallback(async (files: File[]) => {
  const newImages = await loadImagesAsBitmaps(files);
  setImages((prev) => [...prev, ...newImages]);
}, []);
```

### Side Effects

Hooks use `useEffect` for side effects:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    generatePreview();
  }, 300);

  return () => clearTimeout(timer);
}, [images, config]);
```

### Cleanup

Hooks properly clean up resources:

```typescript
const removeImage = useCallback((index: number) => {
  setImages((prev) => {
    const newImages = prev.filter((_, i) => i !== index);
    prev[index].bitmap.close(); // Close bitmap to free memory
    return newImages;
  });
}, []);
```

## Creating Custom Hooks

### Example: useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchTerm, 300);
```

### Example: useLocalStorage

```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    },
    [key],
  );

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage("theme", "light");
```

## Best Practices

### 1. Keep Hooks Focused

Each hook should have a single responsibility:

```typescript
// Good
function useCollage() {
  /* collage logic */
}
function useFaceDetector() {
  /* face detection logic */
}

// Bad
function useEverything() {
  /* all logic */
}
```

### 2. Use TypeScript

Define clear types for hook returns:

```typescript
interface CollageState {
  images: LoadedImage[];
  config: CollageConfig;
  // ...
}

function useCollage(): CollageState {
  // ...
}
```

### 3. Memoize Callbacks

Use `useCallback` for event handlers:

```typescript
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

### 4. Clean Up Resources

Properly clean up in effects:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // ...
  });

  return () => clearTimeout(timer);
}, [dependencies]);
```

### 5. Handle Errors

Handle errors gracefully:

```typescript
const exportCollage = useCallback(async () => {
  try {
    await generateCollage();
  } catch (error) {
    console.error("Export failed:", error);
    // Show error to user
  }
}, []);
```

## Next Steps

- Read the [Components Documentation](./12-components.md) for UI components
- Check the [Development Guide](./07-development-guide.md) for development workflows
- Review the [Architecture Documentation](./03-architecture.md) for overall architecture
