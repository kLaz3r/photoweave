# PhotoWeave Features

## Automatic Collage Generation

PhotoWeave offers two intelligent layout algorithms that automatically arrange your photos into beautiful collages.

### Masonry Layout

The masonry layout creates a dynamic, Pinterest-style arrangement where photos of different aspect ratios fit together seamlessly. This layout is perfect for:

- Mixed aspect ratio photos
- Artistic, organic arrangements
- Showcasing variety in your collection

**Configuration:**

```typescript
layout: "Masonry";
```

### Grid Layout

The grid layout creates a uniform, structured arrangement with equal-sized cells. This layout is ideal for:

- Consistent, symmetrical designs
- Print-ready compositions
- Professional presentations

**Configuration:**

```typescript
layout: "Grid";
```

### Layout Selection

Choose between layouts in the Configuration panel:

```tsx
<button onClick={() => setLayout("Masonry")}>Masonry</button>
<button onClick={() => setLayout("Grid")}>Grid</button>
```

## Face-Aware Cropping

PhotoWeave uses MediaPipe for intelligent face detection, ensuring that faces remain visible when photos are cropped to fit the layout.

### How It Works

1. **Face Detection**: MediaPipe analyzes each uploaded image
2. **Smart Cropping**: Images are cropped to maintain face visibility
3. **Margin Control**: Adjustable face margin (default: 8%)

### Configuration Options

| Option                | Type    | Default | Range       |
| --------------------- | ------- | ------- | ----------- |
| `face_aware_cropping` | boolean | `false` | -           |
| `face_margin`         | number  | `0.08`  | `0.0 - 0.3` |

**Example:**

```typescript
{
  face_aware_cropping: true,
  face_margin: 0.10  // 10% margin around faces
}
```

### Debug Mode

In development mode, enable face debugging to visualize detected faces:

```tsx
<input
  type="checkbox"
  checked={debug_faces}
  onChange={(e) => setDebugFaces(e.target.checked)}
/>
```

## High-Resolution Export

PhotoWeave supports export resolutions up to 20,000×20,000 pixels, making it suitable for everything from social media to large-format prints.

### Resolution Options

| DPI     | Use Case               |
| ------- | ---------------------- |
| 96 DPI  | Screen/digital display |
| 150 DPI | Standard print quality |
| 300 DPI | High-quality print     |

### Maximum Dimensions

- **Width**: 50mm - 1219.2mm (Print) / 320px - 20,000px (Digital)
- **Height**: 50mm - 1219.2mm (Print) / 320px - 20,000px (Digital)

### Export Formats

| Format | Description          | Transparency |
| ------ | -------------------- | ------------ |
| JPEG   | Smallest file size   | No           |
| PNG    | Lossless compression | Yes          |
| TIFF   | Print quality        | No           |

**Example:**

```typescript
{
  output_format: "jpeg",  // or "png", "tiff"
  dpi: 300,
  width_mm: 403,  // 40.3cm
  height_mm: 304.8  // 30.48cm
}
```

## Print and Digital Dimension Support

PhotoWeave supports both print (millimeters) and digital (pixels) dimension systems.

### Print Dimensions

Print dimensions are specified in millimeters and converted to pixels based on the selected DPI.

**Common Print Sizes:**

- 9×13cm (Portrait)
- 10×15cm (Portrait)
- 13×18cm (Portrait)
- 15×20cm (Portrait)
- 20×25cm (Portrait)
- 21×29.7cm A4 (Portrait)
- 30×40cm (Portrait)
- 40×50cm (Portrait)
- 50×70cm (Portrait)
- 70×100cm (Portrait)

**Example:**

```typescript
{
  canvasType: "Print",
  sizePreset: "40x30cm (Landscape)",
  resolution: "300 DPI (High)"
}
```

### Digital Dimensions

Digital dimensions are specified in pixels with a fixed 96 DPI for screen display.

**Common Digital Sizes:**

**Phone Screens:**

- 1080×1920 (Portrait)
- 1920×1080 (Landscape)
- 1170×2532 iPhone (Portrait)

**Desktop Wallpapers:**

- 1920×1080 (Landscape)
- 2560×1440 (Landscape)
- 3840×2160 4K (Landscape)

**Social Media:**

- Instagram 1080×1080 (Square)
- Instagram 1080×1350 (Portrait)
- Instagram Story/Reel 1080×1920
- Facebook Post 1200×630
- Twitter/X Header 1500×500
- YouTube Thumbnail 1280×720

**Example:**

```typescript
{
  canvasType: "Digital",
  sizePreset: "Instagram 1080x1080 (Square)"
}
```

### Custom Dimensions

For custom sizes, use the "Custom Dimensions" preset:

```typescript
{
  sizePreset: "Custom Dimensions",
  customWidth: "500",  // mm or px
  customHeight: "500"
}
```

## Configuration Options

PhotoWeave provides extensive configuration options for customizing your collage.

### Canvas Settings

| Option         | Type                   | Default                       | Description         |
| -------------- | ---------------------- | ----------------------------- | ------------------- |
| `canvasType`   | `"Print" \| "Digital"` | `"Print"`                     | Output type         |
| `sizePreset`   | string                 | `"40x30cm (Landscape)"`       | Size preset         |
| `customWidth`  | string                 | `""`                          | Custom width        |
| `customHeight` | string                 | `""`                          | Custom height       |
| `resolution`   | string                 | `"150 DPI (Standard)"`        | DPI setting         |
| `format`       | string                 | `"JPEG (Smallest File Size)"` | Output format       |
| `transparency` | boolean                | `false`                       | Enable transparency |

### Layout Settings

| Option           | Type                  | Default     | Description                |
| ---------------- | --------------------- | ----------- | -------------------------- |
| `layout`         | `"Masonry" \| "Grid"` | `"Masonry"` | Layout algorithm           |
| `spacing`        | number                | `0.03`      | Gap between images (0-0.3) |
| `maintainAspect` | boolean               | `true`      | Preserve aspect ratio      |

### Advanced Settings

| Option                | Type    | Default     | Description           |
| --------------------- | ------- | ----------- | --------------------- |
| `background_color`    | string  | `"#FFFFFF"` | Background color      |
| `apply_shadow`        | boolean | `false`     | Apply drop shadow     |
| `pretrim_borders`     | boolean | `false`     | Trim image borders    |
| `face_aware_cropping` | boolean | `false`     | Enable face detection |
| `face_margin`         | number  | `0.08`      | Face margin (0-0.3)   |

### Spacing Control

Adjust the spacing between images with a slider:

```tsx
<input
  type="range"
  min={0}
  max={0.3}
  step={0.01}
  value={spacing}
  onChange={(e) => setSpacing(parseFloat(e.target.value))}
/>
```

Spacing is displayed as a percentage (0-30%).

## Image Management Features

PhotoWeave provides comprehensive tools for managing your photo collection.

### File Upload

**Supported Formats:**

- JPEG
- PNG
- GIF
- BMP
- TIFF
- WEBP

**Upload Methods:**

1. **Drag & Drop**: Drag files directly onto the upload area
2. **File Picker**: Click "Choose Files" to select from your device
3. **Append Mode**: Add photos to existing selection

**Example:**

```tsx
<input type="file" multiple accept="image/*" onChange={onPickFiles} />
```

### Image Preview

Uploaded images are displayed as thumbnails with:

- Preview URL generation
- File size tracking
- Image count display

**File Statistics:**

```typescript
const fileStats = {
  count: selectedImages.length,
  sizeMB: totalSizeInMB,
};
```

### Image Ordering

Two ordering modes are available:

**Chronological:**

- Sorts by EXIF date/time
- Falls back to file modification time
- Preserves temporal sequence

**Random:**

- Shuffles images randomly
- Creates varied arrangements
- Great for artistic collages

**Example:**

```tsx
<button onClick={() => setOrderMode("chronological")}>
  Chronologically
</button>
<button onClick={() => setOrderMode("random")}>
  Random
</button>
```

### Image Removal

Remove individual images or clear all:

```tsx
// Remove single image
const onRemoveImage = (id: string) => {
  setSelectedImages((prev) => prev.filter((i) => i.id !== id));
};

// Clear all images
const onClearAll = () => {
  selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
  setSelectedImages([]);
};
```

### EXIF Extraction

PhotoWeave extracts EXIF metadata from JPEG files to determine shot time:

```typescript
async function extractExifShotTimeMs(file: File): Promise<number | null> {
  // Extracts DateTimeOriginal or DateTime from EXIF
  // Returns timestamp in milliseconds
}
```

## Grid Optimization Hints

When using the Grid layout, PhotoWeave provides optimization hints to help you achieve a perfect grid.

### How It Works

The optimization endpoint analyzes:

- Current number of images
- Canvas dimensions
- Spacing settings
- DPI

It then recommends:

- Optimal number of images
- Ideal grid dimensions (columns × rows)
- How many images to add or remove

### Optimization Response

```typescript
{
  columns: number | null,      // Recommended columns
  rows: number | null,         // Recommended rows
  optimalNumImages: number | null,  // Ideal total images
  delta: number | null         // Images to add (+) or remove (-)
}
```

### UI Display

The optimization hints are displayed in the Preview panel:

```tsx
{
  gridAdvice.optimalNumImages != null && (
    <div>
      <div>
        Ideal grid: {gridAdvice.columns} × {gridAdvice.rows}
      </div>
      <div>Target photos: {gridAdvice.optimalNumImages}</div>
      {gridAdvice.delta > 0 && <button>Add {gridAdvice.delta} photo(s)</button>}
      {gridAdvice.delta < 0 && (
        <button>Remove {Math.abs(gridAdvice.delta)}</button>
      )}
    </div>
  );
}
```

### Perfect Grid Detection

When your current image count matches a perfect grid, you'll see:

> "You're already at a perfect grid."

## Dark/Light Theme Support

PhotoWeave includes a comprehensive theming system with dark and light modes.

### Theme System

The theme system uses CSS custom properties for seamless switching:

```css
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

### Theme Toggle

Toggle between themes with the ThemeToggle component:

```tsx
<ThemeToggle />
```

### Theme Persistence

Theme preference is persisted in localStorage and respects system preferences:

```typescript
const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => {
        set({ theme });
        applyThemeToDocument(theme);
      },
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },
    }),
    { name: "theme", storage: createJSONStorage(() => localStorage) },
  ),
);
```

### System Preference Detection

PhotoWeave automatically detects your system's color scheme preference:

```typescript
const system: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
```

## Real-Time Preview with Debouncing

PhotoWeave provides real-time preview updates with intelligent debouncing to optimize performance.

### Preview System

The preview system uses:

- **Debounced updates**: 400ms delay prevents excessive requests
- **Abort controllers**: Cancels in-flight requests
- **Low-resolution preview**: Fast JPEG rendering
- **Progress indication**: Visual feedback during loading

### Debouncing Implementation

```typescript
const requestPreviewDebounced = useCallback(
  () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      // Abort any in-flight request
      if (abortRef.current) abortRef.current.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoadingPreview(true);
      setPreviewError(null);

      // Send preview request
      sendPreviewRequest(controller.signal)
        .then((blob) => {
          const objUrl = URL.createObjectURL(blob);
          setPreviewUrl(objUrl);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setPreviewError(err.message);
          }
        })
        .finally(() => {
          setIsLoadingPreview(false);
        });
    }, 400);
  },
  [
    /* dependencies */
  ],
);
```

### Preview Triggers

Preview updates are triggered by:

- Image selection changes
- Layout changes
- Dimension changes
- Spacing adjustments
- Configuration updates

### Preview Optimization

To ensure fast previews:

- Images are compressed to 100px long side
- JPEG format at 60% quality
- Low-resolution rendering
- Caching of compressed files

```typescript
async function compressImageToTinyJpeg(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const longSide = Math.max(width, height);
  const scale = longSide > 100 ? 100 / longSide : 1;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await canvas.toBlob((b) => b, "image/jpeg", 0.6);

  return new File([blob], file.name, { type: "image/jpeg" });
}
```

### Preview vs. Final Output

**Important Note:** The preview is rendered at low resolution for speed. The final collage may have slight layout differences due to:

- Higher resolution calculations
- Rounding in the packing algorithm
- Different image processing

For accurate results, always review the final downloaded collage.

## Additional Features

### File Format Support

PhotoWeave supports a wide range of image formats:

| Format | Read | Write | Notes                 |
| ------ | ---- | ----- | --------------------- |
| JPEG   | Yes  | Yes   | Most common format    |
| PNG    | Yes  | Yes   | Supports transparency |
| GIF    | Yes  | No    | Static images only    |
| BMP    | Yes  | No    | Uncompressed          |
| TIFF   | Yes  | Yes   | Print quality         |
| WEBP   | Yes  | No    | Modern web format     |

### Accessibility

PhotoWeave includes accessibility features:

- Keyboard navigation support
- ARIA labels for interactive elements
- Screen reader compatible
- High contrast mode support

### Responsive Design

The interface adapts to all screen sizes:

- Mobile-first approach
- Touch-friendly controls
- Optimized layouts for tablets
- Desktop enhancements

### Performance Optimizations

- Web Workers for heavy processing
- Image compression for previews
- Debounced API calls
- Efficient state management
- Lazy loading of components
