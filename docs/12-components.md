# PhotoWeave Components Reference

This guide provides an overview of all UI components in PhotoWeave.

## Component Overview

PhotoWeave uses a component-based architecture with React 19 and TypeScript.

### Component Tree

```
src/components/
├── collage/              # Collage-specific components
│   ├── ImageUploader.tsx
│   ├── CollageCanvas.tsx
│   ├── ConfigPanel.tsx
│   ├── ExportButton.tsx
│   └── GridOptimization.tsx
├── icons/                # Custom icons
├── ui/                   # UI primitives
├── Navbar.tsx
├── Footer.tsx
├── ThemeToggle.tsx
├── AmbientBackground.tsx
└── ScrollProgressBar.tsx
```

## Collage Components

### ImageUploader

The ImageUploader component handles file uploads and displays image thumbnails.

**Props:**

```typescript
interface ImageUploaderProps {
  images: Thumbnail[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onShuffle: () => void;
  onSortChronologically: () => void;
}

interface Thumbnail {
  id: string;
  previewUrl: string;
}
```

**Features:**

- Drag & drop file upload
- File picker with multiple selection
- Thumbnail grid display
- Remove individual images
- Clear all images
- Shuffle images
- Sort chronologically

**Usage:**

```tsx
<ImageUploader
  images={thumbnails}
  onFiles={addImages}
  onRemove={removeImage}
  onClear={clearImages}
  onShuffle={shuffleImages}
  onSortChronologically={sortImagesChronologically}
/>
```

### CollageCanvas

The CollageCanvas component displays the collage preview.

**Props:**

```typescript
interface CollageCanvasProps {
  canvas: HTMLCanvasElement | null;
  isGenerating: boolean;
  progress: number;
}
```

**Features:**

- Displays preview canvas
- Shows loading state
- Displays progress bar
- Responsive sizing

**Usage:**

```tsx
<CollageCanvas
  canvas={previewCanvas}
  isGenerating={isGenerating}
  progress={progress}
/>
```

### ConfigPanel

The ConfigPanel component provides configuration options for the collage.

**Props:**

```typescript
interface ConfigPanelProps {
  config: CollageConfig;
  onChange: (config: Partial<CollageConfig>) => void;
  onFaceDetectorLoading: boolean;
  onFaceDetectorReady: boolean;
  onEnsureFaceDetector: () => Promise<void>;
}
```

**Features:**

- Canvas settings (dimensions, DPI)
- Layout settings (style, spacing)
- Appearance settings (background color, shadows)
- Output settings (format)
- Face detection toggle
- Advanced settings

**Usage:**

```tsx
<ConfigPanel
  config={config}
  onChange={setConfig}
  onFaceDetectorLoading={faceLoading}
  onFaceDetectorReady={faceReady}
  onEnsureFaceDetector={ensureLoaded}
/>
```

### ExportButton

The ExportButton component handles collage export and download.

**Props:**

```typescript
interface ExportButtonProps {
  imageCount: number;
  isGenerating: boolean;
  outputFormat: OutputFormat;
  onExport: () => void;
}
```

**Features:**

- Disabled when no images
- Shows loading state during export
- Displays output format
- Triggers export on click

**Usage:**

```tsx
<ExportButton
  imageCount={images.length}
  isGenerating={isGenerating}
  outputFormat={config.outputFormat}
  onExport={exportCollage}
/>
```

### GridOptimization

The GridOptimization component provides hints for achieving perfect grid layouts.

**Props:**

```typescript
interface GridOptimizationProps {
  gridInfo: GridInfo | null;
  onAddPhotos: () => void;
  onRemovePhotos: (count: number) => void;
}

interface GridInfo {
  columns: number;
  rows: number;
  isPerfect: boolean;
  optimalNumImages: number | null;
  delta: number | null;
}
```

**Features:**

- Shows current grid dimensions
- Indicates if grid is perfect
- Suggests adding or removing images
- Quick actions to add/remove photos

**Usage:**

```tsx
<GridOptimization
  gridInfo={gridInfo}
  onAddPhotos={handleAddPhotos}
  onRemovePhotos={handleRemoveN}
/>
```

## Layout Components

### Navbar

The Navbar component provides site navigation.

**Features:**

- Logo and branding
- Navigation links
- Mobile menu
- Theme toggle

**Usage:**

```tsx
<Navbar />
```

### Footer

The Footer component displays site footer information.

**Features:**

- Copyright information
- Social links
- Additional navigation

**Usage:**

```tsx
<Footer />
```

### ThemeToggle

The ThemeToggle component allows users to switch between light and dark themes.

**Features:**

- Toggle between light/dark mode
- System preference detection
- Theme persistence

**Usage:**

```tsx
<ThemeToggle />
```

## Background Components

### AmbientBackground

The AmbientBackground component provides an animated background effect.

**Features:**

- Gradient animation
- Smooth transitions
- Performance optimized

**Usage:**

```tsx
<AmbientBackground />
```

### HeroBackground

The HeroBackground component provides a gradient background for the hero section.

**Features:**

- Radial gradient
- Color mixing
- Responsive sizing

**Usage:**

```tsx
<HeroBackground />
```

## Utility Components

### ScrollProgressBar

The ScrollProgressBar component displays reading progress.

**Features:**

- Tracks scroll position
- Smooth animation
- Auto-hide at top

**Usage:**

```tsx
<ScrollProgressBar />
```

## UI Primitives

PhotoWeave uses Radix UI primitives for accessible UI components.

### Accordion

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

## Icons

PhotoWeave uses React Icons for icon components.

### Usage

```tsx
import { FaShuffle, FaSort, FaTrash } from "react-icons/fa";

<button onClick={shuffleImages}>
  <FaShuffle />
  Shuffle
</button>;
```

### Available Icons

- `FaShuffle` - Shuffle images
- `FaSort` - Sort images
- `FaTrash` - Remove images
- `FaPlus` - Add images
- `FaDownload` - Download collage
- `FaSun` - Light theme
- `FaMoon` - Dark theme

## Component Patterns

### Client Components

All interactive components use the `"use client"` directive:

```tsx
"use client";

export function MyComponent() {
  // Interactive code
}
```

### Custom Hooks

Components use custom hooks for state management:

```tsx
export function MyComponent() {
  const { images, config, addImages } = useCollage();

  return <div>{/* JSX */}</div>;
}
```

### Event Handlers

Event handlers are memoized with `useCallback`:

```tsx
const handleExport = useCallback(() => {
  exportCollage();
}, [exportCollage]);
```

## Styling

Components use Tailwind CSS for styling:

```tsx
<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">{/* Content */}</div>
```

### Theme Colors

Components use CSS custom properties for theming:

```tsx
<div className="bg-[var(--theme-background)] text-[var(--theme-text)]">
  {/* Content */}
</div>
```

## Accessibility

Components follow accessibility best practices:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## Next Steps

- Read the [Hooks Documentation](./13-hooks.md) for custom React hooks
- Check the [Development Guide](./07-development-guide.md) for development workflows
- Review the [Architecture Documentation](./03-architecture.md) for overall architecture
