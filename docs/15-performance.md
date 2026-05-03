# PhotoWeave Performance Guide

This guide covers performance optimizations and best practices for PhotoWeave.

## Overview

PhotoWeave is designed for performance with several optimizations:

- Web Workers for off-main-thread processing
- Debounced preview generation
- Preview downscaling
- Face caching
- Bitmap memory management

## Web Workers

### Off-Main-Thread Processing

Heavy image processing runs in Web Workers to keep the UI responsive:

```typescript
// src/lib/collage/worker-bridge.ts

export async function generateCollageWithWorker(
  images: LoadedImage[],
  config: CollageConfig,
  onProgress: (percent: number) => void,
): Promise<HTMLCanvasElement> {
  const worker = createWorker();

  worker.postMessage({ images, config });

  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.type === "progress") {
        onProgress(e.data.percent);
      } else if (e.data.type === "done") {
        resolve(e.data.imageBitmap);
      } else if (e.data.type === "error") {
        reject(new Error(e.data.message));
      }
    };
  });
}
```

### Benefits

- **Responsive UI**: Main thread remains responsive during processing
- **Parallel Processing**: Utilizes multiple CPU cores
- **Better User Experience**: Smooth animations and interactions

### Fallback Strategy

If Web Workers are not supported, the application falls back to main-thread processing:

```typescript
if (typeof OffscreenCanvas === "undefined") {
  return generateCollage(images, config, onProgress);
}
```

## Debounced Preview

### Preview Debouncing

Preview generation is debounced to prevent excessive re-renders:

```typescript
// src/hooks/useCollage.ts

useEffect(() => {
  const timer = setTimeout(() => {
    generatePreview();
  }, 300);

  return () => clearTimeout(timer);
}, [images, config]);
```

### Benefits

- **Fewer Renders**: Reduces unnecessary preview generations
- **Better Performance**: Less CPU usage during configuration changes
- **Smoother UX**: UI remains responsive

## Preview Downscaling

### Low-Resolution Preview

Previews are rendered at low resolution for speed:

```typescript
// src/lib/collage/collage-generator.ts

export function generatePreview(
  images: LoadedImage[],
  config: CollageConfig,
): HTMLCanvasElement {
  // Downscale images to max 1600px
  const scaledImages = images.map((img) => ({
    ...img,
    bitmap: downscaleBitmap(img.bitmap, 1600),
  }));

  // Limit canvas to 500px on longest edge
  const maxDimension = 500;
  const scale = Math.min(
    maxDimension / config.widthPx,
    maxDimension / config.heightPx,
  );

  const canvas = document.createElement("canvas");
  canvas.width = config.widthPx * scale;
  canvas.height = config.heightPx * scale;

  // Composite without face detection
  compositeCollage(scaledImages, config, canvas, true);

  return canvas;
}
```

### Benefits

- **Fast Rendering**: Smaller canvases render faster
- **Less Memory**: Lower memory usage for previews
- **Better UX**: Instant feedback during configuration

## Face Caching

### Face Detection Caching

Face detection results are cached per image:

```typescript
// src/lib/collage/face-detection.ts

const _faceCache = new Map<number, FaceDetection[]>();

export function getOrDetectFaces(
  img: LoadedImage,
  canvas: HTMLCanvasElement,
  config: CollageConfig,
  imageIndex: number,
): FaceDetection[] {
  // Check cache first
  if (_faceCache.has(imageIndex)) {
    return _faceCache.get(imageIndex)!;
  }

  // Detect faces
  const faces = detectFaces(canvas);

  // Cache result
  _faceCache.set(imageIndex, faces);

  return faces;
}
```

### Benefits

- **Faster Re-renders**: Avoids expensive re-detection
- **Better Performance**: Reduced CPU usage
- **Consistent Results**: Same detection results across renders

## Bitmap Memory Management

### Closing Bitmaps

ImageBitmaps are properly closed to prevent memory leaks:

```typescript
// src/hooks/useCollage.ts

const removeImage = useCallback((index: number) => {
  setImages((prev) => {
    const newImages = prev.filter((_, i) => i !== index);
    // Close bitmap to free memory
    prev[index].bitmap.close();
    return newImages;
  });
}, []);

const clearImages = useCallback(() => {
  setImages((prev) => {
    // Close all bitmaps
    prev.forEach((img) => img.bitmap.close());
    return [];
  });
}, []);
```

### Benefits

- **No Memory Leaks**: Properly frees memory
- **Better Performance**: More memory available for other operations
- **Stable Application**: Prevents memory-related crashes

## OffscreenCanvas

### Zero-Copy Transfer

OffscreenCanvas enables zero-copy transfer of ImageBitmaps:

```typescript
// src/lib/collage/collage-worker.ts

const canvas = new OffscreenCanvas(width, height);
const ctx = canvas.getContext("2d");

// Draw images
ctx.drawImage(bitmap, x, y, width, height);

// Transfer to main thread
const imageBitmap = await createImageBitmap(canvas);
postMessage({ type: "done", imageBitmap }, [imageBitmap]);
```

### Benefits

- **Faster Transfer**: No copying of image data
- **Lower Memory**: Shared memory between threads
- **Better Performance**: Reduced overhead

## Lazy Loading

### MediaPipe Lazy Loading

MediaPipe is loaded only when needed:

```typescript
// src/hooks/useFaceDetector.ts

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

### Benefits

- **Faster Initial Load**: Smaller initial bundle
- **On-Demand Loading**: Loads only when needed
- **Better UX**: Faster page load time

## Code Splitting

### Dynamic Imports

Use dynamic imports for code splitting:

```typescript
// Lazy load MediaPipe
const vision = await import("@mediapipe/tasks-vision");
```

### Benefits

- **Smaller Bundle**: Reduces initial bundle size
- **Faster Load**: Faster page load time
- **Better UX**: Improved perceived performance

## Image Optimization

### Image Formats

Use efficient image formats:

- **JPEG**: Smallest file size for photos
- **PNG**: Lossless compression with transparency
- **WEBP**: Modern format with better compression

### Image Compression

Compress images before upload:

```typescript
import imageCompression from "browser-image-compression";

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
});
```

## React Performance

### useMemo

Use `useMemo` for expensive computations:

```typescript
const sortedImages = useMemo(
  () => images.sort((a, b) => a.timestamp - b.timestamp),
  [images],
);
```

### useCallback

Use `useCallback` for event handlers:

```typescript
const handleExport = useCallback(() => {
  exportCollage();
}, [exportCollage]);
```

### React.memo

Use `React.memo` for expensive components:

```typescript
export const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data,
}) {
  // Expensive rendering
});
```

## CSS Performance

### CSS Custom Properties

Use CSS custom properties for theming:

```css
:root {
  --theme-background: #ffffff;
  --theme-text: #000000;
}

[data-theme="dark"] {
  --theme-background: #0f172a;
  --theme-text: #f8fafc;
}
```

### Benefits

- **Fast Theme Switching**: No JavaScript overhead
- **Better Performance**: Browser-native
- **Smooth Transitions**: CSS transitions work natively

## Performance Monitoring

### Chrome DevTools

Use Chrome DevTools Performance tab to profile:

1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Perform actions
5. Stop recording
6. Analyze results

### Lighthouse

Run Lighthouse for performance insights:

```bash
npx lighthouse http://localhost:3000 --view
```

### Web Vitals

Monitor Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

## Best Practices

### 1. Optimize Images

- Use appropriate image formats
- Compress images before upload
- Use lazy loading for large images

### 2. Minimize Re-renders

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Use `React.memo` for expensive components

### 3. Use Web Workers

- Offload heavy processing to workers
- Use OffscreenCanvas for rendering
- Transfer ImageBitmaps without copying

### 4. Cache Results

- Cache face detection results
- Cache computed values
- Use memoization

### 5. Optimize Network

- Use efficient image formats
- Compress assets
- Use CDN for static assets

## Troubleshooting

### Slow Preview Generation

If preview generation is slow:

- Check if Web Workers are supported
- Reduce preview resolution
- Disable face detection for preview

### Memory Issues

If you encounter memory issues:

- Close ImageBitmaps when done
- Limit the number of images
- Use smaller images

### UI Freezing

If the UI freezes during processing:

- Ensure Web Workers are being used
- Check for blocking operations
- Use `requestIdleCallback` for non-critical tasks

## Next Steps

- Read the [Deployment Guide](./14-deployment.md) for deployment tips
- Check the [Development Guide](./07-development-guide.md) for development workflows
- Review the [Architecture Documentation](./03-architecture.md) for overall architecture
