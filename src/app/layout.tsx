import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const SITE = "https://www.atakasa.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "A-TAKASA — İhtiyaç fazlası ürününü takas et, ücretsiz", template: "%s | A-TAKASA" },
  description: "Kullanmadığın ürünü fotoğraf ve videoyla ilan et, ihtiyacın olan ürünle takas et. Satış yok, para yok: ücretsiz takas platformu.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "A-TAKASA", locale: "tr_TR", url: SITE },
  manifest: "/manifest.json",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
