import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "A-Takasa | Ücretsiz Takas Sitesi – Eşyanı İlan Et, Takas Et", template: "%s | A-Takasa" },
  description: "Telefon, araba, ev, saat, çakmak, mobilya ve her türlü eşyayı takas et. İhtiyaç fazlası eşyanı ilan et, istediğin başka bir eşyayla değiştir. Ücretsiz, satış yok, karşılıklı onay.",
  keywords: ["takas sitesi", "ücretsiz takas", "eşya takası", "telefon takası", "araba takası", "ev takası", "saat takası", "mobilya takası", "ikinci el takas", "takas ilanları", "takas et", "eşya değiştir", "at takasa", "atakasa"],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  applicationName: "A-Takasa",
  openGraph: { type: "website", siteName: "A-Takasa", locale: "tr_TR", url: SITE_URL, title: "A-Takasa | Ücretsiz Takas Sitesi", description: "İhtiyacın olmayan eşyayı ilan et, istediğinle takas et. Telefon, araba, ev, saat, mobilya ve daha fazlası." },
  twitter: { card: "summary", title: "A-Takasa | Ücretsiz Takas Sitesi", description: "İhtiyacın olmayan eşyayı ilan et, istediğinle takas et." },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f9d6b" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <JsonLd data={{ "@context": "https://schema.org", "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}#org`, name: "A-Takasa", alternateName: ["Atakasa", "A Takasa", "At Takasa"], url: SITE_URL, description: "Ücretsiz eşya takas platformu." },
          { "@type": "WebSite", "@id": `${SITE_URL}#site`, name: "A-Takasa", url: SITE_URL, inLanguage: "tr", publisher: { "@id": `${SITE_URL}#org` } },
        ] }} />
        <Navbar />
        <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-10 border-t bg-white py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} A-Takasa · Para yok, sadece takas.</p>
          <p className="mt-1 space-x-3"><Link href="/nasil-calisir" className="hover:underline">Nasıl çalışır?</Link><Link href="/takas-rehberi" className="hover:underline">Takas rehberi</Link><Link href="/kategori/telefon-tablet" className="hover:underline">Telefon takası</Link><Link href="/kategori/otomobil-vasita" className="hover:underline">Araba takası</Link><Link href="/kategori/emlak" className="hover:underline">Ev takası</Link></p>
        </footer>
      </body>
    </html>
  );
}
