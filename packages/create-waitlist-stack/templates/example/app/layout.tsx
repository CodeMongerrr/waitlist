import type { Metadata, Viewport } from "next";
import { Newsreader, Source_Serif_4, Inter, JetBrains_Mono } from "next/font/google";
import { buildAllJsonLd } from "@waitlist-stack/seo";
import config from "../waitlist.config";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#f4f4f1",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = buildAllJsonLd(config);
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
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
