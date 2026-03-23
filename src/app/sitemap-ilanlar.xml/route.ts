import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectMongoDB();

    const BASE = "https://www.atakasa.com";

    const ilanlar = await Varlik.find({})
      .sort({ updatedAt: -1 })
      .select("slug _id updatedAt createdAt kategori")
      .lean()
      .limit(50000);

    if (!ilanlar || ilanlar.length === 0) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
      );
    }

    const yuksekOncelikli = ["Elektronik", "Araç", "Emlak", "Mobilya"];

    const urls = ilanlar.map((ilan: any) => {
      const slug = ilan.slug || ilan._id.toString();
      const lastmod = new Date(ilan.updatedAt || ilan.createdAt || Date.now())
        .toISOString().split("T")[0];
      const kategori = ilan.kategori || "";
      const priority = yuksekOncelikli.some(k => kategori.includes(k)) ? "0.8" : "0.7";
      return `  <url>
    <loc>${BASE}/varlik/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });

  } catch (err) {
    console.error("sitemap-ilanlar hatası:", err);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${BASE}/#webpage`,
  url: BASE,
  name: "A-Takasa Borsa Vitrini",
  description:
    "Türkiye genelinde satılık ve takaslık ürünler. Elektronik, araç, emlak ve daha fazlası.",
  isPartOf: { "@id": `${BASE}/#website` },
  about: { "@id": `${BASE}/#organization` },
  inLanguage: "tr-TR",
};

// ✅ FAQ Schema — Google'da "Sıkça Sorulan Sorular" kutucuğu çıkarır
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${BASE}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "A-Takasa'da ilan vermek ücretsiz mi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evet, A-Takasa'da ilan vermek tamamen ücretsizdir. Ücretsiz üye olun, istediğiniz kadar ilan verin.",
      },
    },
    {
      "@type": "Question",
      name: "Takas nasıl yapılır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "İstediğiniz ilana 'Takas Teklifi Ver' butonuna tıklayın, kendi ürününüzü seçin ve teklifi gönderin. Satıcı kabul ederse takas gerçekleşir.",
      },
    },
    {
      "@type": "Question",
      name: "Güvenli ödeme nasıl çalışır?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A-Takasa güvenli ödeme havuzu sistemiyle çalışır. Ödemeniz teslimat tamamlanana kadar havuzda bekler, sonra satıcıya aktarılır.",
      },
    },
    {
      "@type": "Question",
      name: "Hangi kategorilerde ilan verebilirim?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Elektronik, araç, emlak, mobilya, tekstil, antika, kitap, kozmetik, petshop, oyun konsolu ve daha birçok kategoride ilan verebilirsiniz.",
      },
    },
    {
      "@type": "Question",
      name: "Satıcı dolandırıcılığından nasıl korunurum?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A-Takasa güvenli ödeme havuzu sistemi sayesinde ödemeniz ürünü teslim alana kadar korunur. Tüm satıcılar onay sürecinden geçer.",
      },
    },
  ],
};

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" className={`${dSans.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Preconnect & DNS Prefetch — LCP için kritik */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Hreflang — çok dilli SEO */}
        <link rel="alternate" hrefLang="tr"        href={BASE} />
        <link rel="alternate" hrefLang="tr-DE"     href="https://atakasa.de" />
        <link rel="alternate" hrefLang="tr-NL"     href="https://atakasa.nl" />
        <link rel="alternate" hrefLang="x-default" href={BASE} />

        {/* Apple PWA */}
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style"  content="default" />
        <meta name="apple-mobile-web-app-title"             content="A-Takasa" />
        <meta name="mobile-web-app-capable"                 content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
          <BottomNav />
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
