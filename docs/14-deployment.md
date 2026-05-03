# PhotoWeave Deployment Guide

This guide covers deploying PhotoWeave to various platforms.

## Deployment Options

PhotoWeave can be deployed to:

- **Vercel** (Recommended)
- **Netlify**
- **Docker**
- **Any Node.js hosting platform**

## Vercel Deployment

Vercel is the recommended platform for deploying PhotoWeave.

### Prerequisites

- A Vercel account
- A GitHub repository with your PhotoWeave code

### Steps

1. **Import Project**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

3. **Environment Variables**

   Add the following environment variables:

   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   ```

   **Note**: The database is currently not used in the application.

4. **Deploy**

   Click "Deploy" to deploy your application.

### Vercel Configuration

Create a `vercel.json` file for custom configuration:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Custom Domain

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS instructions

## Netlify Deployment

### Prerequisites

- A Netlify account
- A GitHub repository with your PhotoWeave code

### Steps

1. **Import Project**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build**
   - Build command: `pnpm build`
   - Publish directory: `.next`
   - Base directory: `/`

3. **Environment Variables**

   Add the following environment variables:

   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   ```

4. **Deploy**

   Click "Deploy site"

### Netlify Configuration

Create a `netlify.toml` file:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
```

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the root directory:

```dockerfile
# Base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm
RUN npm install -g pnpm

# Build the application
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: "3.8"

services:
  photoweave:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/photoweave
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=photoweave
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Building and Running

```bash
# Build the image
docker build -t photoweave .

# Run the container
docker run -p 3000:3000 photoweave

# Or use Docker Compose
docker-compose up -d
```

## Environment Variables

### Required Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/photoweave"
```

### Optional Variables

```env
NODE_ENV="production"
API_BASE_URL=""
```

### Production Build

To skip environment validation during production builds:

```bash
SKIP_ENV_VALIDATION=true pnpm build
```

## Build Optimization

### Static Export

For static hosting, configure Next.js for static export:

```javascript
// next.config.js
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Image Optimization

For platforms without image optimization, disable it:

```javascript
// next.config.js
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

## Performance Monitoring

### Vercel Analytics

Vercel Analytics is built-in for Vercel deployments:

```tsx
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry

For error tracking, add Sentry:

```bash
pnpm add @sentry/nextjs
```

```javascript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});
```

## Security

### Content Security Policy

Add CSP headers in `next.config.js`:

```javascript
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

### HTTPS

Ensure HTTPS is enabled:

- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Docker: Use a reverse proxy (nginx, traefik)

## Scaling

### Horizontal Scaling

For high traffic, use multiple instances:

```yaml
# docker-compose.yml
services:
  photoweave:
    deploy:
      replicas: 3
```

### Load Balancing

Use a load balancer:

- Vercel: Automatic
- Netlify: Automatic
- Docker: Use nginx or traefik

## Monitoring

### Health Check

Add a health check endpoint:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "healthy" });
}
```

### Logging

Use structured logging:

```typescript
console.log(
  JSON.stringify({
    level: "info",
    message: "Collage generated",
    timestamp: new Date().toISOString(),
  }),
);
```

## Troubleshooting

### Build Failures

If the build fails:

```bash
# Clear cache
rm -rf .next node_modules

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build
```

### Runtime Errors

Check the browser console and server logs for errors.

### Environment Variables

Ensure all required environment variables are set:

```bash
# Check environment variables
printenv | grep DATABASE_URL
```

## Next Steps

- Read the [Performance Guide](./15-performance.md) for optimization tips
- Check the [Development Guide](./07-development-guide.md) for development workflows
- Review the [Architecture Documentation](./03-architecture.md) for overall architecture
