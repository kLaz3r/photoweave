# PhotoWeave Tech Stack

PhotoWeave is built with modern web technologies chosen for performance, developer experience, and user privacy.

## Core Framework

### Next.js 15

**Why Next.js?**

- **App Router**: File-based routing with React Server Components
- **Optimized Performance**: Automatic code splitting and image optimization
- **SEO Friendly**: Built-in metadata and sitemap generation
- **Deployment Ready**: First-class support for Vercel and other platforms

**Key Features Used:**

```typescript
// src/app/collage/page.tsx
"use client"; // Client component for interactive features

export default function CollagePage() {
  // Interactive collage editor
}
```

### React 19

**Why React 19?**

- **Latest Features**: Access to the newest React capabilities
- **Concurrent Rendering**: Improved performance for complex UIs
- **Automatic Batching**: Fewer re-renders for better performance
- **Improved Hooks**: Better developer experience

**Key Patterns:**

```typescript
// Custom hooks for state management
const { images, config, addImages, exportCollage } = useCollage();

// Event handlers with useCallback
const handleExport = useCallback(() => {
  exportCollage();
}, [exportCollage]);
```

### TypeScript

**Why TypeScript?**

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and inline documentation
- **Self-Documenting Code**: Types serve as documentation
- **Refactoring Confidence**: Make changes with confidence

**Key Patterns:**

```typescript
// src/lib/collage/config.ts
export interface CollageConfig {
  widthPx: number;
  heightPx: number;
  layoutStyle: LayoutStyle;
  spacing: number;
  backgroundColor: string;
  // ... more properties
}

export type LayoutStyle = "masonry" | "grid";
export type OutputFormat = "jpeg" | "png";
```

## Styling

### Tailwind CSS 4.0

**Why Tailwind CSS?**

- **Utility-First**: Rapid UI development without leaving HTML
- **Responsive Design**: Mobile-first approach with responsive modifiers
- **Customization**: Easy to extend with custom themes
- **Small Bundle Size**: Only includes used styles

**Configuration:**

```javascript
// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**Usage:**

```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
  {/* Responsive grid layout */}
</div>
```

### CSS Custom Properties

**Why CSS Variables?**

- **Theme Support**: Easy dark/light mode switching
- **Runtime Changes**: Update styles without JavaScript
- **Performance**: Browser-native, no JavaScript overhead

**Theme System:**

```css
/* src/styles/globals.css */
:root {
  --theme-background: #ffffff;
  --theme-text: #000000;
  --theme-primary: #6366f1;
  --theme-accent: #8b5cf6;
}

[data-theme="dark"] {
  --theme-background: #0f172a;
  --theme-text: #f8fafc;
  --theme-primary: #818cf8;
  --theme-accent: #a78bfa;
}
```

## State Management

### Zustand

**Why Zustand?**

- **Simple API**: Minimal boilerplate
- **TypeScript Support**: First-class TypeScript support
- **Performance**: No unnecessary re-renders
- **Persistence**: Built-in middleware for localStorage

**Theme Store:**

```typescript
// src/lib/theme.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
      },
    }),
    { name: "theme" },
  ),
);
```

### React Hooks

**Why Custom Hooks?**

- **Reusable Logic**: Share stateful logic across components
- **Testability**: Easy to test in isolation
- **Clean Components**: Keep UI components focused

**useCollage Hook:**

```typescript
// src/hooks/useCollage.ts
export function useCollage() {
  const [images, setImages] = useState<LoadedImage[]>([]);
  const [config, setConfig] = useState<CollageConfig>(DEFAULT_COLLAGE_CONFIG);
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );

  // Debounced preview generation
  useEffect(() => {
    const timer = setTimeout(() => {
      generatePreview();
    }, 300);
    return () => clearTimeout(timer);
  }, [images, config]);

  return {
    images,
    config,
    previewCanvas,
    addImages,
    removeImage,
    exportCollage,
    // ... more methods
  };
}
```

## Image Processing

### Web Workers

**Why Web Workers?**

- **Off-Main-Thread Processing**: Keep UI responsive during heavy operations
- **Parallel Processing**: Utilize multiple CPU cores
- **Better User Experience**: Smooth animations and interactions

**Worker Implementation:**

```typescript
// src/lib/collage/worker-bridge.ts
export function createWorker(): Worker {
  return new Worker(new URL("./collage-worker.ts", import.meta.url), {
    type: "module",
  });
}

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

### OffscreenCanvas

**Why OffscreenCanvas?**

- **Worker Support**: Render canvases in Web Workers
- **Zero-Copy Transfer**: Transfer ImageBitmaps without copying
- **Performance**: Faster than transferring data URLs

**Usage:**

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

## Face Detection

### MediaPipe Tasks Vision

**Why MediaPipe?**

- **Client-Side**: No server calls for face detection
- **High Accuracy**: State-of-the-art face detection
- **Fast Performance**: Optimized for web
- **Privacy**: Images never leave the device

**BlazeFace Model:**

```typescript
// src/lib/collage/face-detection.ts
import { FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";

let faceDetector: FaceDetector | null = null;

export async function loadFaceDetector(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  );

  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/blaze_face_short_range.tflite",
    },
  });
}

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
```

## Animations

### Framer Motion

**Why Framer Motion?**

- **Declarative API**: Easy to define animations
- **Gesture Support**: Built-in gesture handling
- **Performance**: Optimized for 60fps
- **TypeScript Support**: Full type safety

**Usage:**

```tsx
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Animated content */}
</motion.div>;
```

## UI Components

### Radix UI

**Why Radix UI?**

- **Accessible**: Built with accessibility in mind
- **Unstyled**: Full control over styling
- **Composable**: Mix and match primitives
- **TypeScript**: Full type support

**Accordion Component:**

```tsx
import * as Accordion from "@radix-ui/react-accordion";

<Accordion.Root type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Is it free?</Accordion.Trigger>
    <Accordion.Content>
      Yes, PhotoWeave is completely free to use.
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>;
```

### React Icons

**Why React Icons?**

- **Comprehensive**: Thousands of icons from multiple libraries
- **Tree-Shakeable**: Only import what you use
- **TypeScript**: Full type support
- **Consistent API**: Same API across all icon libraries

**Usage:**

```tsx
import { FaShuffle, FaSort, FaTrash } from "react-icons/fa";

<button onClick={shuffleImages}>
  <FaShuffle />
  Shuffle
</button>;
```

## Form Handling

### React Hook Form

**Why React Hook Form?**

- **Performance**: Minimal re-renders
- **TypeScript**: Full type support
- **Validation**: Built-in validation with Zod
- **Small Bundle**: Only 9KB gzipped

**Usage:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  width: z.number().min(320).max(20000),
  height: z.number().min(320).max(20000),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## Validation

### Zod

**Why Zod?**

- **TypeScript-First**: Types inferred from schemas
- **Composable**: Build complex schemas from simple ones
- **Runtime Validation**: Validate data at runtime
- **Zero Dependencies**: Lightweight and fast

**Usage:**

```typescript
import { z } from "zod";

export const CollageConfigSchema = z.object({
  widthPx: z.number().min(320).max(20000),
  heightPx: z.number().min(320).max(20000),
  layoutStyle: z.enum(["masonry", "grid"]),
  spacing: z.number().min(0).max(100),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  maintainAspectRatio: z.boolean(),
  applyShadow: z.boolean(),
  outputFormat: z.enum(["jpeg", "png"]),
});

export type CollageConfig = z.infer<typeof CollageConfigSchema>;
```

## File Upload

### React Dropzone

**Why React Dropzone?**

- **Drag & Drop**: Easy drag and drop support
- **File Validation**: Built-in file type validation
- **Accessibility**: Keyboard accessible
- **Customizable**: Full control over styling

**Usage:**

```tsx
import { useDropzone } from "react-dropzone";

const { getRootProps, getInputProps } = useDropzone({
  accept: { "image/*": [] },
  multiple: true,
  onDrop: (files) => addImages(files),
});

<div {...getRootProps()}>
  <input {...getInputProps()} />
  <p>Drag & drop images here</p>
</div>;
```

## Image Processing Libraries

### Pica

**Why Pica?**

- **High Quality**: Lanczos resampling for sharp images
- **Fast**: WebAssembly acceleration
- **Cross-Browser**: Works in all modern browsers

**Usage:**

```typescript
import pica from "pica";

const picaInstance = pica();

await picaInstance.resize(sourceCanvas, targetCanvas, {
  quality: 3,
  alpha: true,
});
```

### browser-image-compression

**Why browser-image-compression?**

- **Client-Side**: Compress images in the browser
- **Configurable**: Quality and size options
- **Multiple Formats**: JPEG, PNG, WEBP

**Usage:**

```typescript
import imageCompression from "browser-image-compression";

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
});
```

## Database (Configured but Unused)

### Drizzle ORM

**Why Drizzle?**

- **Type-Safe**: Full TypeScript support
- **SQL-Like**: Familiar query syntax
- **Lightweight**: Small bundle size
- **Migration Support**: Built-in migration tools

**Configuration:**

```typescript
// drizzle.config.ts
export default defineConfig({
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Note**: The database is currently configured but not used in the application. All data is client-side only.

## Development Tools

### ESLint

**Why ESLint?**

- **Code Quality**: Catch errors and anti-patterns
- **Consistency**: Enforce code style
- **TypeScript Support**: Full type-aware linting

**Configuration:**

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/await-thenable": "error",
    },
  },
];
```

### Prettier

**Why Prettier?**

- **Consistent Formatting**: Automatic code formatting
- **Opinionated**: No configuration needed
- **Editor Integration**: Works with all major editors

**Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### Husky + lint-staged

**Why Husky?**

- **Git Hooks**: Run scripts on git events
- **Pre-commit**: Ensure code quality before committing
- **Team Consistency**: Same checks across all contributors

**Configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"]
  }
}
```

## Testing

### Vitest

**Why Vitest?**

- **Fast**: Native ESM support
- **Compatible**: Jest-compatible API
- **TypeScript**: Built-in TypeScript support

**Configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

### Playwright

**Why Playwright?**

- **Cross-Browser**: Test in Chrome, Firefox, Safari
- **Fast**: Parallel test execution
- **Reliable**: Auto-waiting for elements

**Configuration:**

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
});
```

## Package Manager

### pnpm

**Why pnpm?**

- **Disk Space**: Efficient disk usage with hard links
- **Fast**: Faster installation than npm/yarn
- **Strict**: Prevents phantom dependencies
- **Monorepo Support**: Built-in workspace support

**Usage:**

```bash
pnpm install
pnpm dev
pnpm build
```

## Summary

| Technology        | Purpose          | Key Benefit                           |
| ----------------- | ---------------- | ------------------------------------- |
| Next.js 15        | Framework        | App Router, SEO, Performance          |
| React 19          | UI Library       | Latest features, Concurrent rendering |
| TypeScript        | Type Safety      | Catch errors at compile time          |
| Tailwind CSS 4.0  | Styling          | Utility-first, Responsive design      |
| Zustand           | State Management | Simple API, Performance               |
| MediaPipe         | Face Detection   | Client-side, Privacy                  |
| Web Workers       | Performance      | Off-main-thread processing            |
| Framer Motion     | Animations       | Declarative, 60fps                    |
| Radix UI          | Components       | Accessible, Unstyled                  |
| Zod               | Validation       | TypeScript-first, Runtime validation  |
| Drizzle ORM       | Database         | Type-safe, SQL-like                   |
| ESLint/Prettier   | Code Quality     | Consistent, Error-free code           |
| Vitest/Playwright | Testing          | Fast, Reliable tests                  |
| pnpm              | Package Manager  | Efficient, Fast                       |

## Future Considerations

### Potential Additions

- **tRPC**: For type-safe API routes if server features are added
- **NextAuth.js**: For user authentication if accounts are added
- **React Query**: For server state management if API is added
- **SWR**: Alternative to React Query for data fetching

### Performance Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking and monitoring
- **Lighthouse CI**: Automated performance testing
