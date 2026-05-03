# PhotoWeave Development Guide

This guide covers the development workflow, available scripts, testing, and debugging for PhotoWeave.

## Development Workflow

### Branching Strategy

PhotoWeave uses a simple branching strategy:

- **`main`**: Production-ready code
- **`beta`**: Development branch (current)
- **`feature/*`**: Feature branches
- **`fix/*`**: Bug fix branches

### Creating a Feature Branch

```bash
# Create and checkout a new feature branch
git checkout -b feature/my-feature

# Make your changes
git add .
git commit -m "feat: add my feature"

# Push to remote
git push -u origin feature/my-feature
```

### Commit Message Conventions

Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(collage): add masonry layout algorithm
fix(worker): handle worker creation failure
docs(readme): update installation instructions
style(components): format with prettier
refactor(hooks): simplify useCollage hook
test(components): add ImageUploader tests
chore(deps): update dependencies
```

### Pull Request Process

1. **Create a branch** from `beta`
2. **Make changes** and commit
3. **Push** to remote
4. **Create PR** with descriptive title and description
5. **Wait for review** and address feedback
6. **Merge** when approved

## Available Scripts

### Development Scripts

```bash
# Start development server with Turbopack
pnpm dev

# Start development server without Turbopack
next dev

# Start production server
pnpm start

# Build and preview
pnpm preview
```

### Build Scripts

```bash
# Build for production
pnpm build

# Build with analysis
ANALYZE=true pnpm build
```

### Code Quality Scripts

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Type check
pnpm typecheck

# Run all checks
pnpm check
```

### Formatting Scripts

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format:write
```

### Database Scripts

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Push schema to database
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

### Testing Scripts

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## Testing

### Unit Tests with Vitest

Unit tests are written with Vitest and located in `**/*.test.ts` files.

**Example Test:**

```typescript
// src/lib/collage/layouts/grid.test.ts
import { describe, it, expect } from "vitest";
import { gridPack } from "./grid";

describe("gridPack", () => {
  it("should create a grid with correct dimensions", () => {
    const images = [
      { width: 100, height: 100, aspect: 1 },
      { width: 100, height: 100, aspect: 1 },
    ];

    const blocks = gridPack(images, 200, 200, 10);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].x).toBe(10);
    expect(blocks[0].y).toBe(10);
  });
});
```

### E2E Tests with Playwright

E2E tests are written with Playwright and located in `e2e/` directory.

**Example Test:**

```typescript
// e2e/collage.spec.ts
import { test, expect } from "@playwright/test";

test("should upload images and generate preview", async ({ page }) => {
  await page.goto("http://localhost:3000/collage");

  // Upload images
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles([
    "e2e/fixtures/image1.jpg",
    "e2e/fixtures/image2.jpg",
  ]);

  // Wait for preview
  await page.waitForSelector("img[alt='Collage preview']");

  // Check preview is visible
  const preview = page.locator("img[alt='Collage preview']");
  await expect(preview).toBeVisible();
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test grid.test.ts

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode
pnpm test:e2e --headed
```

## Linting and Formatting

### ESLint

ESLint is configured to enforce code quality and consistency.

**Configuration:**

```javascript
// eslint.config.js
export default [
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },
];
```

**Running ESLint:**

```bash
# Check for issues
pnpm lint

# Fix issues automatically
pnpm lint:fix
```

### Prettier

Prettier is configured to enforce consistent code formatting.

**Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Running Prettier:**

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format:write
```

### Pre-commit Hooks

Husky and lint-staged are configured to run checks before committing.

**Configuration:**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{md,json}": ["prettier --write"]
  }
}
```

## Debugging

### Debugging React Components

Use React DevTools to inspect components:

1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to Components tab
4. Inspect component tree, props, and state

### Debugging with Console Logs

Add console logs to debug:

```typescript
console.log("Images:", images);
console.log("Config:", config);
console.log("Progress:", progress);
```

### Debugging Web Workers

Web Workers can be debugged in Chrome:

1. Open DevTools
2. Go to Sources tab
3. Find the worker under "Workers"
4. Set breakpoints and debug

### Debugging TypeScript

TypeScript errors are shown in the editor and terminal:

```bash
# Type check
pnpm typecheck
```

### Debugging Build Issues

If the build fails:

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build

# Check for TypeScript errors
pnpm typecheck
```

## Common Development Tasks

### Adding a New Component

1. Create the component file:

```typescript
// src/components/MyComponent.tsx
export function MyComponent() {
  return <div>Hello, World!</div>;
}
```

2. Use the component:

```tsx
import { MyComponent } from "~/components/MyComponent";

export default function Page() {
  return <MyComponent />;
}
```

### Adding a New Hook

1. Create the hook file:

```typescript
// src/hooks/useMyHook.ts
import { useState } from "react";

export function useMyHook() {
  const [value, setValue] = useState(0);

  return { value, setValue };
}
```

2. Use the hook:

```tsx
import { useMyHook } from "~/hooks/useMyHook";

export default function Component() {
  const { value, setValue } = useMyHook();

  return <div>{value}</div>;
}
```

### Adding a New Layout Algorithm

1. Create the layout function:

```typescript
// src/lib/collage/layouts/my-layout.ts
import type { LoadedImage, ImageBlock } from "../config";

export function myLayoutPack(
  images: LoadedImage[],
  canvasWidth: number,
  canvasHeight: number,
  spacing: number,
): ImageBlock[] {
  // Implement your layout algorithm
  return [];
}
```

2. Add to layout selector:

```tsx
// src/components/collage/ConfigPanel.tsx
const layoutOptions = [
  { value: "masonry", label: "Masonry" },
  { value: "grid", label: "Grid" },
  { value: "my-layout", label: "My Layout" },
];
```

3. Implement in collage generator:

```typescript
// src/lib/collage/collage-generator.ts
import { myLayoutPack } from "./layouts/my-layout";

export function compositeCollage(/* ... */) {
  if (config.layoutStyle === "my-layout") {
    blocks = myLayoutPack(images, canvasWidth, canvasHeight, spacing);
  }
  // ...
}
```

### Modifying the Theme

1. Update theme colors:

```css
/* src/styles/globals.css */
:root {
  --theme-background: #ffffff;
  --theme-text: #000000;
  /* ... */
}
```

2. Add new theme variables:

```css
:root {
  --theme-new-color: #ff0000;
}
```

3. Use in components:

```tsx
<div style={{ color: "var(--theme-new-color)" }}>Custom color</div>
```

## Performance Optimization

### Profiling

Use Chrome DevTools Performance tab to profile:

1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Perform actions
5. Stop recording
6. Analyze results

### Optimizing Images

- Use WebP format for better compression
- Resize images before upload
- Use lazy loading for large images

### Optimizing React

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Avoid unnecessary re-renders

### Optimizing Web Workers

- Transfer ImageBitmaps instead of data URLs
- Use OffscreenCanvas for rendering
- Batch operations

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows the project's style guide
- [ ] All tests pass
- [ ] No linting errors
- [ ] TypeScript compiles without errors
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Changes are tested manually

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

## Next Steps

- Read the [Code Style Guide](./08-code-style.md) for coding conventions
- Check the [Architecture Documentation](./03-architecture.md) to understand the codebase
- Review the [Contributing Guide](./16-contributing.md) for contribution guidelines
