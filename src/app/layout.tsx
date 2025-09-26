import "~/styles/globals.css";

import AmbientBackground from "~/components/AmbientBackground";
import Footer from "~/components/Footer";
import Navbar from "~/components/Navbar";
import ScrollProgressBar from "~/components/ScrollProgressBar";
import ThemeInit from "~/components/ThemeInit";
import ThemeScript from "~/components/ThemeScript";

import { type Metadata, type Viewport } from "next";
import Script from "next/script";

import { Bricolage_Grotesque, Righteous } from "next/font/google";
import {
  absoluteUrl,
  metadataBaseUrl,
  openGraphImages,
  siteMetadata,
  socialProfiles,
} from "~/lib/seo";

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl,
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  keywords: siteMetadata.keywords,
  applicationName: siteMetadata.name,
  authors: [{ name: siteMetadata.creator, url: siteMetadata.githubUrl }],
  creator: siteMetadata.creator,
  publisher: siteMetadata.publisher,
  category: "photography",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteMetadata.siteUrl,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    siteName: siteMetadata.name,
    locale: siteMetadata.locale,
    type: "website",
    images: openGraphImages,
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    site: siteMetadata.twitterHandle,
    creator: siteMetadata.twitterHandle,
    images: openGraphImages,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon1.png", sizes: "32x32", type: "image/png" },
      { url: "/icon0.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "PhotoWeave",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#05040a" },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteMetadata.name,
  url: siteMetadata.siteUrl,
  logo: absoluteUrl("/photoweave-logo.svg"),
  sameAs: socialProfiles,
  contactPoint: {
    "@type": "ContactPoint",
    email: siteMetadata.contactEmail,
    contactType: "customer support",
    availableLanguage: ["en"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteMetadata.name,
  url: siteMetadata.siteUrl,
  description: siteMetadata.description,
  publisher: {
    "@type": "Organization",
    name: siteMetadata.publisher,
    url: siteMetadata.siteUrl,
  },
};

const righteous = Righteous({
  subsets: ["latin"],
  variable: "--font-righteous",
  weight: ["400"],
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${righteous.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-9630512481401787" />
        <Script
          id="schema-org-organization"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          id="schema-org-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className="font-body bg-background relative w-screen max-w-screen overflow-x-clip">
        <ThemeScript />
        <ThemeInit />
        <AmbientBackground opacity={0.18} />
        <ScrollProgressBar />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
