import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

async function getIlan(id: string) {
  try {
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${base}/api/varliklar/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
}

// ✅ Her ilan için dinamik SEO meta — Google'da ayrı ayrı indexlenir
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ilan = await getIlan(params.id);
  if (!ilan) return { title: "İlan Bulunamadı | A-TAKASA" };

  const baslik = ilan.baslik || "İlan";
  const aciklama = ilan.aciklama
    ? ilan.aciklama.slice(0, 155)
    : `${baslik} — ${ilan.kategori || "Ürün"} — ${ilan.sehir || "Türkiye"}. A-TAKASA'da sat veya takas et!`;
  const gorsel =
    (Array.isArray(ilan.resimler) && ilan.resimler[0]) ||
    "https://atakasa.com/og-default.jpg";
  const url = `https://atakasa.com/varlik/${params.id}`;

  return {
    title: `${baslik} | ${ilan.sehir || "Türkiye"} — A-TAKASA`,
    description: aciklama,
    keywords: [
      baslik, ilan.kategori, ilan.sehir,
      "takas", "ikinci el", "satılık", "A-TAKASA",
      `${baslik} satılık`, `${baslik} takas`,
    ].filter(Boolean),
    openGraph: {
      title: `${baslik} — A-TAKASA`,
      description: aciklama,
      url,
      type: "website",
      images: [{ url: gorsel, width: 800, height: 600, alt: baslik }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${baslik} — A-TAKASA`,
      description: aciklama,
      images: [gorsel],
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

// ✅ Product + BreadcrumbList + Offer schema
function buildSchema(ilan: any, id: string) {
  const gorsel =
    (Array.isArray(ilan.resimler) ? ilan.resimler : [])
      .filter((u: string) => typeof u === "string" && u.length > 5);
  const fiyat = Number(ilan.fiyat || 0);
  const url = `https://atakasa.com/varlik/${id}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: ilan.baslik,
    description: ilan.aciklama || ilan.baslik,
    image: gorsel.length > 0 ? gorsel : ["https://atakasa.com/og-default.jpg"],
    sku: id,
    brand: { "@type": "Brand", name: "A-TAKASA" },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: fiyat,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability:
        ilan.durum === "aktif"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "A-TAKASA",
        url: "https://atakasa.com",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "TR",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "TR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
      },
    },
    itemCondition:
      ilan.kategori?.toLowerCase().includes("sıfır")
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://atakasa.com" },
      { "@type": "ListItem", position: 2, name: ilan.kategori || "İlanlar", item: `https://atakasa.com/kategori/${(ilan.kategori || "diger").toLowerCase().replace(/\s/g, "-")}` },
      { "@type": "ListItem", position: 3, name: ilan.baslik, item: url },
    ],
  };

  return { productSchema, breadcrumbSchema };
}

// Bu component gerçek ilan sayfanızın içeriğini render eder
// Mevcut ilan sayfanızı import edin — sadece schema ve meta ekliyoruz
import IlanDetayClient from "./IlanDetayClient";

export default async function IlanDetayPage({ params }: Props) {
  const ilan = await getIlan(params.id);
  if (!ilan) return notFound();

  const { productSchema, breadcrumbSchema } = buildSchema(ilan, params.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <IlanDetayClient id={params.id} initialData={ilan} />
    </>
  );
}
