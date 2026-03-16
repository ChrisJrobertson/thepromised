import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/components/layout/Providers";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.theypromised.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
    template: "%s | TheyPromised",
  },
  description:
    "Free UK complaint tracking platform. AI-drafted letters, evidence logging, and step-by-step escalation guides.",
  keywords: [
    "UK complaint tracker",
    "ombudsman complaint",
    "consumer rights UK",
    "escalation guide",
    "complaint letter generator",
    "case file export",
    "energy ombudsman",
    "financial ombudsman",
  ],
  authors: [{ name: "SynqForge Ltd" }],
  creator: "SynqForge Ltd",
  publisher: "SynqForge Ltd",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: APP_URL,
    siteName: "TheyPromised",
    title: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
    description:
      "Free UK complaint tracking platform. AI-drafted letters, evidence logging, and step-by-step escalation guides.",
  },
  twitter: {
    card: "summary",
    title: "TheyPromised — Track Complaints. Build Evidence. Get Results.",
    description: "Free UK complaint tracking tool with AI-drafted letters and escalation guides.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TheyPromised",
  url: APP_URL,
  description:
    "UK consumer complaint tracking platform by SynqForge Ltd",
  logo: `${APP_URL}/icon-512.png`,
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TheyPromised",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser",
  description:
    "Track UK consumer complaints, follow escalation guides, generate professional case files",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
      name: "Free plan",
    },
    {
      "@type": "Offer",
      price: "4.99",
      priceCurrency: "GBP",
      name: "Basic plan",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "4.99",
        priceCurrency: "GBP",
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: "1",
          unitCode: "MON",
        },
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link href="/manifest.json" rel="manifest" />
        <link
          href="/apple-touch-icon.png"
          rel="apple-touch-icon"
          sizes="180x180"
        />
        <link
          href="/favicon-32x32.png"
          rel="icon"
          sizes="32x32"
          type="image/png"
        />
        <link
          href="/favicon-16x16.png"
          rel="icon"
          sizes="16x16"
          type="image/png"
        />
        <meta
          content="yes"
          name="apple-mobile-web-app-capable"
        />
        <meta
          content="black-translucent"
          name="apple-mobile-web-app-status-bar-style"
        />
        <meta content="TheyPromised" name="apple-mobile-web-app-title" />
        <meta content="#1e3a5f" name="theme-color" />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          type="application/ld+json"
        />
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          type="application/ld+json"
        />
      </head>
      <body
        className={`${inter.variable} ${dmSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
