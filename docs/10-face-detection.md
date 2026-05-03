# PhotoWeave Face Detection

PhotoWeave uses Google's MediaPipe BlazeFace model for intelligent face detection and face-aware cropping.

## Overview

Face detection enables PhotoWeave to:

- Detect faces in uploaded photos
- Crop images intelligently to keep faces visible
- Apply margins around detected faces
- Debug face detection with visual feedback

## MediaPipe Integration

### Loading the Face Detector

The face detector is loaded lazily to improve initial load time:

```typescript
// src/lib/collage/face-detection.ts

import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let faceDetector: FaceDetector | null = null;

export async function loadFaceDetector(): Promise<void> {
  if (faceDetector) return;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );

  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/blaze_face_short_range.tflite",
    },
    runningMode: "image",
  });
}
```

### Detecting Faces

```typescript
export async function detectFaces(
  canvas: HTMLCanvasElement,
): Promise<FaceDetection[]> {
  if (!faceDetector) {
    await loadFaceDetector();
  }

  const results = await faceDetector.detect(canvas);

  return results.detections.map((d) => ({
    x1: d.boundingBox.originX,
    y1: d.boundingBox.originY,
    x2: d.boundingBox.originX + d.boundingBox.width,
    y2: d.boundingBox.originY + d.boundingBox.height,
    score: d.categories[0]?.score ?? 0,
  }));
}

export interface FaceDetection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
}
```

### Merging Overlapping Detections

MediaPipe may return multiple overlapping detections for the same face. We merge them:

```typescript
export function mergeFaceDetections(
  detections: FaceDetection[],
  overlapThreshold: number = 0.3,
): FaceDetection[] {
  if (detections.length === 0) return [];

  const merged: FaceDetection[] = [];

  for (const detection of detections) {
    let mergedWith = false;

    for (const existing of merged) {
      const overlap = calculateOverlap(detection, existing);
      if (overlap > overlapThreshold) {
        // Merge with existing detection
        existing.x1 = Math.min(existing.x1, detection.x1);
        existing.y1 = Math.min(existing.y1, detection.y1);
        existing.x2 = Math.max(existing.x2, detection.x2);
        existing.y2 = Math.max(existing.y2, detection.y2);
        existing.score = Math.max(existing.score, detection.score);
        mergedWith = true;
        break;
      }
    }

    if (!mergedWith) {
      merged.push({ ...detection });
    }
  }

  return merged;
}

function calculateOverlap(a: FaceDetection, b: FaceDetection): number {
  const xOverlap = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const yOverlap = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const overlapArea = xOverlap * yOverlap;
  const aArea = (a.x2 - a.x1) * (a.y2 - a.y1);
  const bArea = (b.x2 - b.x1) * (b.y2 - b.y1);
  const unionArea = aArea + bArea - overlapArea;

  return overlapArea / unionArea;
}
```

### Applying Face Margin

Add margin around detected faces:

```typescript
export function applyFaceMargin(
  detections: FaceDetection[],
  imageWidth: number,
  imageHeight: number,
  margin: number,
): FaceDetection[] {
  return detections.map((d) => {
    const width = d.x2 - d.x1;
    const height = d.y2 - d.y1;

    const marginX = width * margin;
    const marginY = height * margin;

    return {
      x1: Math.max(0, d.x1 - marginX),
      y1: Math.max(0, d.y1 - marginY),
      x2: Math.min(imageWidth, d.x2 + marginX),
      y2: Math.min(imageHeight, d.y2 + marginY),
      score: d.score,
    };
  });
}
```

## Face Caching

Face detection is expensive, so we cache results per image:

```typescript
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

  // Merge overlapping detections
  const merged = mergeFaceDetections(faces);

  // Apply margin
  const withMargin = applyFaceMargin(
    merged,
    img.width,
    img.height,
    config.faceMargin,
  );

  // Cache result
  _faceCache.set(imageIndex, withMargin);

  return withMargin;
}

export function clearFaceCache(): void {
  _faceCache.clear();
}
```

## Face-Aware Cropping

### Smart Face Crop

The smart face crop algorithm crops images to focus on detected faces:

```typescript
// src/lib/collage/face-crop.ts

export function smartFaceCrop(
  image: LoadedImage,
  faces: FaceDetection[],
  targetWidth: number,
  targetHeight: number,
): { x: number; y: number; width: number; height: number } {
  if (faces.length === 0) {
    // No faces detected, use center crop
    return centerCrop(image, targetWidth, targetHeight);
  }

  // Calculate bounding box for all faces
  const faceBox = calculateFaceBoundingBox(faces);

  // Calculate crop dimensions
  const cropWidth = Math.min(faceBox.width, image.width);
  const cropHeight = Math.min(faceBox.height, image.height);

  // Calculate crop position
  const cropX = Math.max(0, faceBox.x - (cropWidth - faceBox.width) / 2);
  const cropY = Math.max(0, faceBox.y - (cropHeight - faceBox.height) / 2);

  return {
    x: cropX,
    y: cropY,
    width: cropWidth,
    height: cropHeight,
  };
}

function calculateFaceBoundingBox(faces: FaceDetection[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const x1 = Math.min(...faces.map((f) => f.x1));
  const y1 = Math.min(...faces.map((f) => f.y1));
  const x2 = Math.max(...faces.map((f) => f.x2));
  const y2 = Math.max(...faces.map((f) => f.y2));

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
}

function centerCrop(
  image: LoadedImage,
  targetWidth: number,
  targetHeight: number,
): { x: number; y: number; width: number; height: number } {
  const aspect = targetWidth / targetHeight;
  const imageAspect = image.width / image.height;

  let cropWidth, cropHeight;

  if (imageAspect > aspect) {
    cropHeight = image.height;
    cropWidth = cropHeight * aspect;
  } else {
    cropWidth = image.width;
    cropHeight = cropWidth / aspect;
  }

  const x = (image.width - cropWidth) / 2;
  const y = (image.height - cropHeight) / 2;

  return { x, y, width: cropWidth, height: cropHeight };
}
```

## Debug Mode

Debug mode visualizes detected faces:

```typescript
export function drawFaceDetections(
  ctx: CanvasRenderingContext2D,
  detections: FaceDetection[],
): void {
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 2;

  for (const detection of detections) {
    ctx.strokeRect(
      detection.x1,
      detection.y1,
      detection.x2 - detection.x1,
      detection.y2 - detection.y1,
    );
  }
}
```

## Limitations

### Main Thread Only

MediaPipe does not support Web Workers, so face detection runs on the main thread:

```typescript
// src/lib/collage/worker-bridge.ts

// Worker config disables face detection
const workerConfig = {
  ...config,
  faceAwareCropping: false,
  debugFaces: false,
};
```

### Performance Considerations

- Face detection is expensive (~100-500ms per image)
- Preview generation skips face detection for speed
- Full export uses face detection if enabled
- Face caching reduces repeated detection

### Browser Support

MediaPipe requires modern browsers:

- Chrome 91+
- Firefox 90+
- Safari 15+

## Configuration

### Face Detection Options

```typescript
interface CollageConfig {
  faceAwareCropping: boolean; // Enable face detection
  faceMargin: number; // Margin around faces (0-0.3)
  debugFaces: boolean; // Show detection boxes
}
```

### Default Configuration

```typescript
export const DEFAULT_COLLAGE_CONFIG: CollageConfig = {
  faceAwareCropping: false,
  faceMargin: 0.08, // 8% margin
  debugFaces: false,
};
```

## Usage Example

```typescript
// src/hooks/useCollage.ts

const { ensureLoaded } = useFaceDetector();

const handleExport = async () => {
  // Ensure face detector is loaded
  await ensureLoaded();

  // Export with face detection
  await exportCollage();
};
```

## Next Steps

- Read the [Image Processing Documentation](./11-image-processing.md) for image utilities
- Check the [Collage Engine Documentation](./09-collage-engine.md) for layout algorithms
- Review the [Architecture Documentation](./03-architecture.md) for overall architecture
