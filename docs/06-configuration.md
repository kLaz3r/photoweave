# PhotoWeave Configuration

This guide covers all configuration options for PhotoWeave, including environment variables, application settings, and collage configuration.

## Environment Variables

### Required Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/photoweave"
```

**Note**: The database is currently not used in the application. All processing is client-side only.

### Optional Variables

```env
NODE_ENV="development"  # or "production", "test"
API_BASE_URL=""         # Optional API base URL
```

### Environment Validation

Environment variables are validated using `@t3-oss/env-nextjs`:

```typescript
// src/env.js
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    API_BASE_URL: z.string().url().optional(),
  },
  client: {},
  runtimeEnv: process.env,
});
```

### Skipping Validation

To skip environment validation during builds:

```bash
SKIP_ENV_VALIDATION=true pnpm build
```

## Application Configuration

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Next.js Configuration

```javascript
// next.config.js
const nextConfig = {};

export default nextConfig;
```

### PostCSS Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### ESLint Configuration

```javascript
// eslint.config.js
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { includeIgnoreFile } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: [".next/"],
  },
  {
    extends: [
      ...new FlatCompat({
        baseDirectory: __dirname,
      }).configs(),
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  tseslint.configs.recommended,
  tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];
```

## Collage Configuration

### Configuration Types

```typescript
// src/lib/collage/config.ts

export type LayoutStyle = "masonry" | "grid";
export type OutputFormat = "jpeg" | "png";
export type DimensionMode = "px" | "mm";

export interface CollageConfig {
  // Dimensions
  widthPx: number; // 320-20000, default 1920
  heightPx: number; // 320-20000, default 1080
  widthMm: number; // 50-1219.2, default 304.8
  heightMm: number; // 50-1219.2, default 457.2
  dpi: number; // 72-300, default 96
  dimensionMode: DimensionMode;

  // Layout
  layoutStyle: LayoutStyle;
  spacing: number; // 0-100, default 40

  // Appearance
  backgroundColor: string; // #RRGGBB or #RRGGBBAA
  maintainAspectRatio: boolean;
  applyShadow: boolean;

  // Output
  outputFormat: OutputFormat;

  // Face Detection
  faceAwareCropping: boolean;
  faceMargin: number; // 0-0.3, default 0.08
  pretrimBorders: boolean;

  // Debug
  debugFaces: boolean;
}
```

### Default Configuration

```typescript
export const DEFAULT_COLLAGE_CONFIG: CollageConfig = {
  widthPx: 1920,
  heightPx: 1080,
  widthMm: 304.8,
  heightMm: 457.2,
  dpi: 96,
  dimensionMode: "px",
  layoutStyle: "masonry",
  spacing: 40,
  backgroundColor: "#FFFFFF",
  maintainAspectRatio: true,
  applyShadow: false,
  outputFormat: "jpeg",
  faceAwareCropping: false,
  faceMargin: 0.08,
  pretrimBorders: false,
  debugFaces: false,
};
```

### Configuration Options

#### Canvas Settings

| Option          | Type   | Default | Range        | Description                  |
| --------------- | ------ | ------- | ------------ | ---------------------------- |
| `widthPx`       | number | 1920    | 320-20000    | Canvas width in pixels       |
| `heightPx`      | number | 1080    | 320-20000    | Canvas height in pixels      |
| `widthMm`       | number | 304.8   | 50-1219.2    | Canvas width in millimeters  |
| `heightMm`      | number | 457.2   | 50-1219.2    | Canvas height in millimeters |
| `dpi`           | number | 96      | 72-300       | Resolution in dots per inch  |
| `dimensionMode` | string | "px"    | "px" \| "mm" | Dimension mode               |

#### Layout Settings

| Option                | Type    | Default   | Range               | Description                  |
| --------------------- | ------- | --------- | ------------------- | ---------------------------- |
| `layoutStyle`         | string  | "masonry" | "masonry" \| "grid" | Layout algorithm             |
| `spacing`             | number  | 40        | 0-100               | Spacing as percentage        |
| `maintainAspectRatio` | boolean | true      | -                   | Preserve photo aspect ratios |

#### Appearance Settings

| Option            | Type    | Default   | Range     | Description        |
| ----------------- | ------- | --------- | --------- | ------------------ |
| `backgroundColor` | string  | "#FFFFFF" | Hex color | Background color   |
| `applyShadow`     | boolean | false     | -         | Apply drop shadows |

#### Output Settings

| Option         | Type   | Default | Range           | Description         |
| -------------- | ------ | ------- | --------------- | ------------------- |
| `outputFormat` | string | "jpeg"  | "jpeg" \| "png" | Output image format |

#### Face Detection Settings

| Option              | Type    | Default | Range | Description           |
| ------------------- | ------- | ------- | ----- | --------------------- |
| `faceAwareCropping` | boolean | false   | -     | Enable face detection |
| `faceMargin`        | number  | 0.08    | 0-0.3 | Margin around faces   |
| `pretrimBorders`    | boolean | false   | -     | Trim image borders    |

#### Debug Settings

| Option       | Type    | Default | Range | Description               |
| ------------ | ------- | ------- | ----- | ------------------------- |
| `debugFaces` | boolean | false   | -     | Show face detection boxes |

## Print Presets

### Standard Photo Sizes

| Size         | Dimensions (mm) | Dimensions (inches) |
| ------------ | --------------- | ------------------- |
| 9×13cm       | 90×130          | 3.5×5.1             |
| 10×15cm      | 100×150         | 3.9×5.9             |
| 13×18cm      | 130×180         | 5.1×7.1             |
| 15×20cm      | 150×200         | 5.9×7.9             |
| 20×25cm      | 200×250         | 7.9×9.8             |
| 21×29.7cm A4 | 210×297         | 8.3×11.7            |
| 30×40cm      | 300×400         | 11.8×15.7           |
| 40×50cm      | 400×500         | 15.7×19.7           |
| 50×70cm      | 500×700         | 19.7×27.6           |
| 70×100cm     | 700×1000        | 27.6×39.4           |

### DPI Options

| DPI | Use Case               |
| --- | ---------------------- |
| 96  | Screen/digital display |
| 150 | Standard print quality |
| 300 | High-quality print     |

## Digital Presets

### Phone Screens

| Size             | Dimensions |
| ---------------- | ---------- |
| iPhone Portrait  | 1170×2532  |
| Android Portrait | 1080×1920  |
| Phone Landscape  | 1920×1080  |

### Desktop Wallpapers

| Size | Dimensions |
| ---- | ---------- |
| HD   | 1920×1080  |
| QHD  | 2560×1440  |
| 4K   | 3840×2160  |

### Social Media

| Platform           | Dimensions |
| ------------------ | ---------- |
| Instagram Square   | 1080×1080  |
| Instagram Portrait | 1080×1350  |
| Instagram Story    | 1080×1920  |
| Facebook Post      | 1200×630   |
| Twitter/X Header   | 1500×500   |
| YouTube Thumbnail  | 1280×720   |

## Theme Configuration

### Theme Types

```typescript
type Theme = "light" | "dark";
```

### Theme Colors

```css
/* Light Theme */
:root {
  --theme-background: #ffffff;
  --theme-text: #000000;
  --theme-primary: #6366f1;
  --theme-accent: #8b5cf6;
}

/* Dark Theme */
[data-theme="dark"] {
  --theme-background: #0f172a;
  --theme-text: #f8fafc;
  --theme-primary: #818cf8;
  --theme-accent: #a78bfa;
}
```

### Theme Persistence

Theme preference is persisted in localStorage:

```typescript
// src/lib/theme.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

## Custom Configuration

### Adding Custom Presets

To add custom size presets, modify the preset configuration:

```typescript
// src/components/collage/ConfigPanel.tsx

const CUSTOM_PRESETS = [
  { name: "Custom 1", width: 500, height: 500 },
  { name: "Custom 2", width: 800, height: 600 },
];
```

### Modifying Default Configuration

To change the default configuration:

```typescript
// src/lib/collage/config.ts

export const DEFAULT_COLLAGE_CONFIG: CollageConfig = {
  // Modify defaults here
  widthPx: 1920,
  heightPx: 1080,
  // ...
};
```

### Adding New Layout Algorithms

To add a new layout algorithm:

1. Create the layout function in `src/lib/collage/layouts/`
2. Add the layout type to the `LayoutStyle` type
3. Update the layout selector in `ConfigPanel.tsx`
4. Implement the layout in `collage-generator.ts`

## Configuration Validation

### Zod Schema

```typescript
import { z } from "zod";

export const CollageConfigSchema = z.object({
  widthPx: z.number().min(320).max(20000),
  heightPx: z.number().min(320).max(20000),
  widthMm: z.number().min(50).max(1219.2),
  heightMm: z.number().min(50).max(1219.2),
  dpi: z.number().min(72).max(300),
  dimensionMode: z.enum(["px", "mm"]),
  layoutStyle: z.enum(["masonry", "grid"]),
  spacing: z.number().min(0).max(100),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/),
  maintainAspectRatio: z.boolean(),
  applyShadow: z.boolean(),
  outputFormat: z.enum(["jpeg", "png"]),
  faceAwareCropping: z.boolean(),
  faceMargin: z.number().min(0).max(0.3),
  pretrimBorders: z.boolean(),
  debugFaces: z.boolean(),
});

export type CollageConfig = z.infer<typeof CollageConfigSchema>;
```

## Performance Configuration

### Preview Debounce

The preview generation is debounced to 300ms:

```typescript
// src/hooks/useCollage.ts

useEffect(() => {
  const timer = setTimeout(() => {
    generatePreview();
  }, 300);

  return () => clearTimeout(timer);
}, [images, config]);
```

### Preview Resolution

Previews are rendered at max 500px on the longest edge:

```typescript
// src/lib/collage/collage-generator.ts

const maxDimension = 500;
const scale = Math.min(
  maxDimension / config.widthPx,
  maxDimension / config.heightPx,
);
```

### Worker Fallback

If Web Workers are not supported, the application falls back to main-thread processing:

```typescript
// src/lib/collage/worker-bridge.ts

if (typeof OffscreenCanvas === "undefined") {
  return generateCollage(images, config, onProgress);
}
```

## Security Configuration

### Content Security Policy

Add CSP headers in `next.config.js`:

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

## Next Steps

- Read the [Development Guide](./07-development-guide.md) for development workflows
- Check the [Architecture Documentation](./03-architecture.md) to understand the codebase
- Review the [Collage Engine Documentation](./09-collage-engine.md) for layout algorithms
