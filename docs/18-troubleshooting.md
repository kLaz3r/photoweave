# PhotoWeave Troubleshooting

This guide covers common issues and their solutions.

## Installation Issues

### pnpm install fails

**Problem**: `pnpm install` fails with errors.

**Solutions**:

1. **Clear cache and reinstall**:

   ```bash
   rm -rf node_modules .pnpm-store
   pnpm install
   ```

2. **Use the --force flag**:

   ```bash
   pnpm install --force
   ```

3. **Check pnpm version**:

   ```bash
   pnpm --version
   ```

   Ensure you have pnpm 10.0.0 or later.

### Node.js version too old

**Problem**: Error about Node.js version.

**Solution**:

Install Node.js 18.17 or later from [nodejs.org](https://nodejs.org).

### Environment variables not set

**Problem**: Error about missing environment variables.

**Solution**:

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/photoweave"
   NODE_ENV="development"
   ```

## Build Issues

### Build fails with TypeScript errors

**Problem**: `pnpm build` fails with TypeScript errors.

**Solutions**:

1. **Check TypeScript version**:

   ```bash
   pnpm tsc --version
   ```

2. **Reinstall TypeScript**:

   ```bash
   pnpm install typescript@latest -D
   ```

3. **Clear Next.js cache**:

   ```bash
   rm -rf .next
   pnpm build
   ```

### Build fails with ESLint errors

**Problem**: `pnpm build` fails with ESLint errors.

**Solutions**:

1. **Fix ESLint issues**:

   ```bash
   pnpm lint:fix
   ```

2. **Check ESLint configuration**:

   ```bash
   pnpm lint
   ```

### Build fails with module not found

**Problem**: Error about missing module.

**Solutions**:

1. **Reinstall dependencies**:

   ```bash
   rm -rf node_modules
   pnpm install
   ```

2. **Check import paths**:

   Ensure all imports use the correct path aliases (`~/` for `src/`).

## Runtime Errors

### Images not uploading

**Problem**: Images don't upload when selected.

**Solutions**:

1. **Check file format**: Ensure files are supported (JPEG, PNG, GIF, BMP, TIFF, WEBP)

2. **Check file size**: Very large files may cause issues

3. **Check browser console**: Look for error messages in the browser console

### Preview not updating

**Problem**: Preview doesn't update when settings change.

**Solutions**:

1. **Wait for debounce**: Preview updates after 300ms of inactivity

2. **Check browser console**: Look for error messages

3. **Refresh page**: Try refreshing the page

### Export fails

**Problem**: Export fails or doesn't complete.

**Solutions**:

1. **Check Web Worker support**: Ensure your browser supports Web Workers

2. **Check browser console**: Look for error messages

3. **Try with fewer images**: Large numbers of images may cause issues

4. **Check memory**: Ensure you have enough memory available

### Face detection not working

**Problem**: Face detection doesn't work or is slow.

**Solutions**:

1. **Check browser support**: Ensure your browser supports MediaPipe (Chrome 91+, Firefox 90+, Safari 15+)

2. **Check internet connection**: MediaPipe models are loaded from CDN

3. **Wait for loading**: Face detection may take time to load initially

4. **Disable for preview**: Face detection is disabled for preview generation

## Performance Issues

### Slow preview generation

**Problem**: Preview generation is slow.

**Solutions**:

1. **Reduce image count**: Fewer images render faster

2. **Check device performance**: Older devices may be slower

3. **Disable face detection**: Face detection is disabled for preview

4. **Check browser performance**: Try a different browser

### Slow export

**Problem**: Export takes a long time.

**Solutions**:

1. **Reduce image count**: Fewer images export faster

2. **Reduce resolution**: Lower resolution exports faster

3. **Disable face detection**: Face detection adds processing time

4. **Check device performance**: More powerful devices export faster

### UI freezing during export

**Problem**: UI freezes during export.

**Solutions**:

1. **Check Web Worker support**: Ensure Web Workers are working

2. **Check browser console**: Look for errors about Web Workers

3. **Try a different browser**: Some browsers have better Web Worker support

## Browser-Specific Issues

### Safari

**Problem**: Issues specific to Safari.

**Solutions**:

1. **Check Safari version**: Ensure Safari 15 or later

2. **Enable JavaScript**: Ensure JavaScript is enabled

3. **Clear cache**: Clear Safari cache and cookies

4. **Disable extensions**: Try disabling Safari extensions

### Firefox

**Problem**: Issues specific to Firefox.

**Solutions**:

1. **Check Firefox version**: Ensure Firefox 90 or later

2. **Check privacy settings**: Some privacy settings may block features

3. **Clear cache**: Clear Firefox cache

4. **Disable extensions**: Try disabling Firefox extensions

### Chrome

**Problem**: Issues specific to Chrome.

**Solutions**:

1. **Check Chrome version**: Ensure Chrome 91 or later

2. **Clear cache**: Clear Chrome cache

3. **Disable extensions**: Try disabling Chrome extensions

4. **Check flags**: Some Chrome flags may affect performance

## Mobile Issues

### Images not uploading on mobile

**Problem**: Images don't upload on mobile devices.

**Solutions**:

1. **Check file size**: Mobile devices may have file size limits

2. **Check browser**: Try a different mobile browser

3. **Check permissions**: Ensure the browser has file access permissions

### Performance issues on mobile

**Problem**: Poor performance on mobile devices.

**Solutions**:

1. **Reduce image count**: Fewer images perform better on mobile

2. **Reduce resolution**: Lower resolution performs better

3. **Close other apps**: Free up device resources

4. **Use Wi-Fi**: Faster network for loading MediaPipe models

## Network Issues

### MediaPipe models not loading

**Problem**: MediaPipe models fail to load.

**Solutions**:

1. **Check internet connection**: Ensure you have a stable internet connection

2. **Check CDN status**: The CDN may be temporarily down

3. **Try again later**: Wait and try again

4. **Use VPN**: Some networks may block the CDN

### CORS errors

**Problem**: CORS errors in browser console.

**Solutions**:

1. **Check browser settings**: Some browser settings may cause CORS issues

2. **Disable extensions**: Some extensions may cause CORS issues

3. **Use different browser**: Try a different browser

## Memory Issues

### Out of memory errors

**Problem**: Out of memory errors during export.

**Solutions**:

1. **Reduce image count**: Fewer images use less memory

2. **Reduce resolution**: Lower resolution uses less memory

3. **Close other tabs**: Free up browser memory

4. **Restart browser**: Restart the browser to free memory

### Memory leaks

**Problem**: Application uses more memory over time.

**Solutions**:

1. **Refresh page**: Refresh the page to clear memory

2. **Clear images**: Clear uploaded images when done

3. **Restart browser**: Restart the browser to clear memory

## Getting Help

If you're still having issues:

1. **Check the FAQ**: See the [FAQ](./17-faq.md) for common questions

2. **Search issues**: Search [GitHub Issues](https://github.com/kLaz3r/photoweave/issues) for similar problems

3. **Report a bug**: Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS version
   - Screenshots if applicable

## Next Steps

- Read the [Getting Started Guide](./05-getting-started.md) for installation
- Check the [FAQ](./17-faq.md) for common questions
- Review the [Performance Guide](./15-performance.md) for optimization tips
