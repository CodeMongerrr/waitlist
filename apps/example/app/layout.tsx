import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { buildAllJsonLd } from "@waitlist-stack/seo";
import config from "../waitlist.config";
import "./globals.css";

// Minimal monochrome direction: one neutral heavy grotesque (Inter) carries
// display + body; IBM Plex Mono is the labels/markings voice. No serif, no
// decorative families, the look is precise and quiet, matching the product.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${config.brand.name} · ${config.brand.tagline}`,
  description: config.brand.description,
  applicationName: config.brand.name,
  metadataBase: new URL(config.brand.siteUrl),
  keywords: config.seo.keywords,
  openGraph: {
    type: "website",
    siteName: config.brand.name,
    title: `${config.brand.name} · ${config.brand.tagline}`,
    description: config.brand.description,
    url: config.brand.siteUrl,
    images: [{ url: "/api/og" }],
  },
  twitter: {
    card: "summary_large_image",
    title: config.brand.name,
    description: config.brand.tagline,
    ...(config.founder.twitterHandle
      ? { creator: `@${config.founder.twitterHandle}` }
      : {}),
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = buildAllJsonLd(config);
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        {jsonLd.map((block, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
