# PhotoWeave Overview

## What is PhotoWeave?

PhotoWeave is a client-side photo collage generator that transforms your photo chaos into beautiful, shareable collages. Built with Next.js 15, React 19, and TypeScript, PhotoWeave runs entirely in your browser—no server uploads required.

The application intelligently arranges your photos into stunning collages using smart layout algorithms, with support for both print and digital output formats. Whether you're creating a social media post or a high-quality print for your wall, PhotoWeave delivers professional results with minimal effort.

## Key Value Proposition

### Privacy-First Design

- **Client-side processing**: All image processing happens in your browser
- **No server uploads**: Your photos never leave your device
- **No data collection**: We don't store or share your images

### Instant Results

- **Real-time preview**: See your collage as you make changes
- **Fast rendering**: Web Workers ensure smooth performance
- **No installation**: Works directly in your browser

### Professional Quality

- **High-resolution export**: Support for up to 20,000×20,000 pixels
- **Print-ready output**: Multiple DPI options (96, 150, 300 DPI)
- **Multiple formats**: JPEG, PNG, and TIFF support

## Target Users

### Photographers

- Quickly create portfolio collages
- Showcase event highlights
- Print-quality output for exhibitions

### Social Media Users

- Create Instagram-ready collages
- Share memories across platforms
- Perfect aspect ratios for every platform

### Print Enthusiasts

- Design wall art from personal photos
- Create photo gifts and cards
- Professional print quality output

## Quick Summary of Features

| Feature               | Description                           |
| --------------------- | ------------------------------------- |
| **Smart Layouts**     | Automatic masonry and grid layouts    |
| **Face Detection**    | MediaPipe-powered face-aware cropping |
| **High-Res Export**   | Up to 20,000×20,000 pixels            |
| **Print & Digital**   | mm and px dimension support           |
| **Multiple Formats**  | JPEG, PNG, TIFF with transparency     |
| **Image Management**  | Drag & drop, shuffle, sort, remove    |
| **Grid Optimization** | Hints for perfect grid layouts        |
| **Theme Support**     | Dark and light mode                   |
| **Real-time Preview** | Debounced preview updates             |

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Validation**: Zod schemas
- **Icons**: React Icons

## Architecture

PhotoWeave follows a client-side architecture with:

- **Component-based UI**: Modular React components
- **Type-safe configuration**: Zod schemas for all API contracts
- **Responsive design**: Mobile-first approach
- **Theme system**: CSS custom properties for theming
- **Performance optimization**: Web Workers for heavy processing

## Documentation

- [Features](./02-features.md) - Detailed feature descriptions
- [Installation](./03-installation.md) - Setup and development guide
- [Configuration](./04-configuration.md) - Configuration options reference
- [API Reference](./05-api-reference.md) - API endpoints and schemas
- [Contributing](./06-contributing.md) - Contribution guidelines

## Getting Started

Visit [photoweave.app](https://photoweave.app) to start creating collages, or check out the [Installation Guide](./03-installation.md) to run the application locally.

## License

PhotoWeave is open source. See the LICENSE file for details.
