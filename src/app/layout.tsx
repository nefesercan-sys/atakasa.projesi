import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "A-Takasa | Ücretsiz Eşya Takas Platformu", template: "%s | A-Takasa" },
  description: "İhtiyacın olmayan eşyayı ilan et, ihtiyacın olanla takas et. Satın alma yok, ücret yok: karşılıklı onayla güvenli takas.",
  keywords: ["takas sitesi", "ücretsiz takas", "eşya takası", "ikinci el takas", "ürün takas", "takas ilanları", "karşılıklı takas", "eşya takas et"],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "A-Takasa", locale: "tr_TR", url: SITE_URL },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f9d6b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t bg-white py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} A-Takasa · Para yok, sadece takas.</p>
          <p className="mt-1 space-x-3"><Link href="/nasil-calisir" className="hover:underline">Nasıl çalışır?</Link></p>
        </footer>
      </body>
    </html>
  );
}
