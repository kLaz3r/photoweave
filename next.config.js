/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    optimizePackageImports: [
      "motion",
      "react-icons",
      "react-dropzone",
      "@radix-ui/react-accordion",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
