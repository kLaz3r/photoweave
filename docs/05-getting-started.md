# Getting Started with PhotoWeave

This guide will help you set up and run PhotoWeave locally for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.17 or later
- **pnpm**: Version 10.0.0 or later (recommended package manager)

### Installing Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/).

### Installing pnpm

```bash
npm install -g pnpm@latest
```

Or using the standalone installer:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kLaz3r/photoweave.git
cd photoweave
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- MediaPipe
- And all other dependencies

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/photoweave"
NODE_ENV="development"
```

**Note**: The database is currently not used in the application. All processing is client-side only.

## Running the Development Server

Start the development server with:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Development Server Options

```bash
# Start with Turbopack (faster)
pnpm dev

# Start without Turbopack
next dev

# Start on a different port
PORT=3001 pnpm dev
```

## Building for Production

Build the production bundle:

```bash
pnpm build
```

This will:

- Compile TypeScript
- Optimize assets
- Generate static pages
- Create production-ready build

### Production Build Options

```bash
# Build and start production server
pnpm build
pnpm start

# Build and preview locally
pnpm preview
```

## Project Structure

```
photoweave/
├── docs/                   # Documentation
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── layout.tsx     # Root layout
│   │   ├── page.tsx       # Landing page
│   │   ├── about/         # About page
│   │   └── collage/       # Collage editor
│   ├── components/        # React components
│   │   ├── collage/      # Collage-specific components
│   │   ├── icons/        # Custom icons
│   │   └── ui/           # UI primitives
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core logic
│   │   ├── collage/     # Collage engine
│   │   ├── theme.ts     # Theme state
│   │   └── seo.ts       # SEO metadata
│   ├── server/          # Server-side code
│   │   └── db/          # Database (unused)
│   └── styles/          # Global styles
├── .env.example          # Environment variables template
├── drizzle.config.ts     # Drizzle ORM config
├── eslint.config.js      # ESLint configuration
├── next.config.js        # Next.js configuration
├── package.json         # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tsconfig.json        # TypeScript configuration
└── vitest.config.ts     # Vitest configuration
```

## First Steps

### 1. Upload Images

Navigate to the collage editor at `/collage` and upload images:

- **Drag & Drop**: Drag images directly onto the upload area
- **File Picker**: Click "Choose Files" to select from your device

### 2. Configure Layout

Adjust the layout settings:

- **Layout Style**: Choose between Masonry or Grid
- **Spacing**: Adjust the gap between images
- **Background Color**: Set the background color
- **Dimensions**: Choose print or digital dimensions

### 3. Preview

The preview updates automatically as you make changes:

- **Debounced Preview**: Updates after 300ms of inactivity
- **Low Resolution**: Preview is rendered at 500px for speed
- **Real-Time**: See changes instantly

### 4. Export

Download your collage:

- **Click Export**: Click the "Download Collage" button
- **Choose Format**: JPEG, PNG, or TIFF
- **High Resolution**: Full-resolution export up to 20,000×20,000px

## Common Commands

### Development

```bash
# Start development server
pnpm dev

# Start with Turbopack (faster)
pnpm dev --turbo

# Start production server
pnpm start
```

### Building

```bash
# Build for production
pnpm build

# Build and preview
pnpm preview
```

### Code Quality

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type check
pnpm typecheck

# Run all checks
pnpm check
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format code
pnpm format:write
```

### Database

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

### Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Dependency Issues

If you encounter dependency issues:

```bash
# Clear cache and reinstall
rm -rf node_modules .pnpm-store
pnpm install

# Or use the --force flag
pnpm install --force
```

### TypeScript Errors

If you see TypeScript errors:

```bash
# Check TypeScript version
pnpm tsc --version

# Reinstall TypeScript
pnpm install typescript@latest -D
```

### Build Errors

If the build fails:

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

## Development Tips

### Hot Reload

The development server supports hot reload. Changes to:

- **Components**: Automatically reload
- **Styles**: Automatically update
- **Configuration**: May require restart

### Debugging

Use the browser DevTools to debug:

- **React DevTools**: Inspect component state and props
- **Console Logs**: View console output
- **Network Tab**: Monitor API calls (none in this app)

### Performance Profiling

Use Chrome DevTools Performance tab to profile:

1. Open DevTools
2. Go to Performance tab
3. Click Record
4. Perform actions
5. Stop recording
6. Analyze results

## Next Steps

- Read the [Configuration Guide](./06-configuration.md) for detailed configuration options
- Check the [Development Guide](./07-development-guide.md) for development workflows
- Explore the [Architecture Documentation](./03-architecture.md) to understand the codebase
- Review the [Contributing Guide](./16-contributing.md) to learn how to contribute

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MediaPipe Documentation](https://developers.google.com/mediapipe)
