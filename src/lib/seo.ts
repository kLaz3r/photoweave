const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
  process.env.SITE_URL?.trim() ??
  "https://photoweave.app";

const normalizedSiteUrl = DEFAULT_SITE_URL.replace(/\/$/, "");

export const siteMetadata = {
  name: "PhotoWeave",
  shortName: "PhotoWeave",
  title: "PhotoWeave | AI-Powered Photo Collage Maker",
  description:
    "Turn your camera roll into stunning story-driven collages in minutes. PhotoWeave uses smart layouts, print-ready exports, and effortless customization for memorable sharing.",
  keywords: [
    "photo collage maker",
    "AI collage generator",
    "online collage maker",
    "automatic photo layouts",
    "printable photo collages",
    "PhotoWeave",
    "memory collage",
    "digital scrapbooking",
    "photo wall art",
  ],
  locale: "en_US",
  siteUrl: normalizedSiteUrl,
  creator: "Stefan Nasturas",
  publisher: "PhotoWeave",
  organization: "PhotoWeave",
  twitterHandle: "@PhotoWeaveApp",
  facebookPageUrl: "https://www.facebook.com/PhotoWeaveApp",
  instagramUrl: "https://www.instagram.com/photoweaveapp",
  contactEmail: "hello@photoweave.app",
  githubUrl: "https://github.com/stefannasturas",
  heroImageAlt: "PhotoWeave collage preview",
};

export function absoluteUrl(path = "/"): string {
  try {
    return new URL(path, `${siteMetadata.siteUrl}/`).toString();
  } catch {
    return path;
  }
}

const rawSocialProfiles = [
  siteMetadata.twitterHandle.startsWith("@")
    ? `https://twitter.com/${siteMetadata.twitterHandle.slice(1)}`
    : siteMetadata.twitterHandle,
  siteMetadata.facebookPageUrl,
  siteMetadata.instagramUrl,
  siteMetadata.githubUrl,
];

export const socialProfiles = rawSocialProfiles
  .filter((value): value is string => Boolean(value?.trim()))
  .map((value) => {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://${value.replace(/^\/\//, "")}`;
  });

export const openGraphImages = [
  {
    url: absoluteUrl("/hero-photo.png"),
    alt: siteMetadata.heroImageAlt,
  },
];

export const metadataBaseUrl = (() => {
  try {
    return new URL(siteMetadata.siteUrl);
  } catch {
    return undefined;
  }
})();
