import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { SceneMount } from "@/components/canvas/SceneMount";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { TransitionLayer } from "@/components/providers/Transition";
import { ConsoleGreeting } from "@/components/ui/ConsoleGreeting";
import { Cursor } from "@/components/ui/Cursor";
import { Menu } from "@/components/ui/Menu";
import { Nav } from "@/components/ui/Nav";
import { Preloader } from "@/components/ui/Preloader";
import { site } from "@/content/site";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = `${site.name} | ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.socials[0].href }],
  openGraph: { type: "website", title, description: site.description, siteName: site.name, locale: "en_US" },
  twitter: { card: "summary_large_image", title, description: site.description, creator: "@abulh_x" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SmoothScroll>
          <SceneMount />
          <Nav />
          <Menu />
          <main id="main" className="relative z-[1]">
            {children}
          </main>
          <TransitionLayer />
          <Preloader />
          <Cursor />
          <div className="grain" aria-hidden />
          <ConsoleGreeting />
        </SmoothScroll>
      </body>
    </html>
  );
}
