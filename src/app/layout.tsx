import type { Metadata, Viewport } from "next";
import { Fraunces, Libre_Franklin } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyCta } from "@/components/Blocks";
import { JsonLd } from "@/components/JsonLd";
import { venueSchema } from "@/lib/seo";
import { IS_PREVIEW, SITE } from "@/lib/site";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz"], style: ["normal", "italic"] });
const body = Libre_Franklin({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "The Burland | Reunion and Wedding Venue in St. Anthony, Idaho", template: "%s | The Burland" },
  description: SITE.description,
  applicationName: SITE.name,
  robots: IS_PREVIEW ? { index: false, follow: false } : undefined,
};
export const viewport: Viewport = { themeColor: "#17231d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className={IS_PREVIEW ? "has-preview" : undefined}>
        <a href="#main" className="skip">Skip to content</a>
        {IS_PREVIEW && <div className="preview-banner">Preview build. Hidden from search engines.</div>}
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyCta />
        <JsonLd data={venueSchema()} />
      </body>
    </html>
  );
}
