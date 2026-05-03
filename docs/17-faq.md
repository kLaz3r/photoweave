# PhotoWeave FAQ

Frequently asked questions about PhotoWeave.

## General Questions

### Is PhotoWeave free to use?

Yes, PhotoWeave is completely free to use. All features are available at no cost.

### Does PhotoWeave upload my photos to a server?

No, PhotoWeave processes all images locally in your browser. Your photos never leave your device.

### What image formats are supported?

PhotoWeave supports:

- JPEG
- PNG
- GIF (static images only)
- BMP
- TIFF
- WEBP

### What's the maximum resolution?

PhotoWeave supports export resolutions up to 20,000×20,000 pixels.

### Can I save my collages?

Currently, PhotoWeave only supports downloading collages as image files. Saving and sharing features are planned for future releases.

### Is PhotoWeave open source?

Yes, PhotoWeave is open source. You can view the source code on [GitHub](https://github.com/kLaz3r/photoweave).

## Features

### How does face detection work?

PhotoWeave uses Google's MediaPipe BlazeFace model to detect faces in your photos. When enabled, it crops images intelligently to keep faces visible.

### What's the difference between Masonry and Grid layouts?

- **Masonry**: Creates a Pinterest-style staggered arrangement with variable-height columns
- **Grid**: Creates a uniform arrangement with equal-sized cells

### Can I customize the spacing between images?

Yes, you can adjust the spacing from 0% to 100% of the canvas size.

### Can I change the background color?

Yes, you can set any background color using hex color codes (e.g., #FFFFFF for white).

### Can I add drop shadows to images?

Yes, you can enable drop shadows in the Advanced Settings section.

### What's the difference between print and digital dimensions?

- **Print**: Dimensions are specified in millimeters and converted to pixels based on DPI
- **Digital**: Dimensions are specified in pixels with a fixed 96 DPI

## Performance

### Why is the preview low resolution?

The preview is rendered at low resolution (max 500px) for speed. The final export uses full resolution.

### Why does face detection take time?

Face detection is computationally expensive (~100-500ms per image). It's only used during full export, not preview generation.

### Can I use PhotoWeave on mobile?

Yes, PhotoWeave works on mobile devices. However, performance may vary depending on your device.

### How many images can I use?

There's no hard limit, but performance may degrade with very large numbers of images (100+).

## Browser Support

### What browsers are supported?

PhotoWeave supports modern browsers:

- Chrome 91+
- Firefox 90+
- Safari 15+
- Edge 91+

### Does PhotoWeave work on Safari?

Yes, PhotoWeave works on Safari 15 and later.

### Does PhotoWeave work on Firefox?

Yes, PhotoWeave works on Firefox 90 and later.

### Does PhotoWeave work on mobile browsers?

Yes, PhotoWeave works on mobile browsers including Chrome Mobile and Safari Mobile.

## Privacy

### Is my data safe?

Yes, all processing happens locally in your browser. Your photos are never uploaded to any server.

### Does PhotoWeave collect any data?

No, PhotoWeave does not collect any personal data or image data.

### Can I use PhotoWeave offline?

Yes, PhotoWeave works offline once the page is loaded. However, MediaPipe models are loaded from a CDN and require an internet connection for the first load.

## Troubleshooting

### Why is my collage not generating?

Check that:

- You have at least 2 images uploaded
- Your browser supports Web Workers
- JavaScript is enabled

### Why is face detection not working?

Check that:

- Face detection is enabled in settings
- Your browser supports MediaPipe
- You have a stable internet connection (for loading MediaPipe models)

### Why is the export taking so long?

Export time depends on:

- Number of images
- Image resolution
- Whether face detection is enabled
- Your device's processing power

### Why is the preview different from the final export?

The preview is rendered at low resolution for speed. The final export uses full resolution and may have slight layout differences.

## Development

### How can I contribute?

See the [Contributing Guide](./16-contributing.md) for information on how to contribute.

### How do I report a bug?

Please report bugs on [GitHub Issues](https://github.com/kLaz3r/photoweave/issues) with:

- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your browser and OS version

### How do I request a feature?

Please request features on [GitHub Issues](https://github.com/kLaz3r/photoweave/issues) with:

- A clear description of the feature
- Why you need it
- Any alternatives you considered

## Next Steps

- Read the [Getting Started Guide](./05-getting-started.md) for installation
- Check the [Features Documentation](./02-features.md) for detailed feature descriptions
- Review the [Troubleshooting Guide](./18-troubleshooting.md) for common issues
