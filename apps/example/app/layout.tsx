import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Space_Grotesk,
  IBM_Plex_Mono,
  Instrument_Serif,
} from "next/font/google";
import { buildAllJsonLd } from "@waitlist-stack/seo";
import config from "../waitlist.config";
import "./globals.css";

// Type system for the "Iridescent Spec Room" direction:
// Bricolage Grotesque = oversized editorial display; Space Grotesk = body/UI;
// IBM Plex Mono = the "markings" voice (indices, labels, chips, colophon);
// Instrument Serif italic = reserved jewel for the phrase "in your voice".
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${config.brand.name} — ${config.brand.tagline}`,
  description: config.brand.description,
  applicationName: config.brand.name,
  metadataBase: new URL(config.brand.siteUrl),
  keywords: config.seo.keywords,
  openGraph: {
    type: "website",
    siteName: config.brand.name,
    title: `${config.brand.name} — ${config.brand.tagline}`,
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
  themeColor: "#08090A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = buildAllJsonLd(config);
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} ${instrumentSerif.variable}`}
    >
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
