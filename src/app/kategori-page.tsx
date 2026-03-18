import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
  params: { slug: string };
}

const KATEGORILER: Record<string, { ad: string; aciklama: string; keywords: string[] }> = {
  "takas": {
    ad: "Takas İlanları",
    aciklama: "Türkiye genelinde binlerce takas ilanı. Elektronik, araç, emlak, mobilya ve daha fazlasını güvenle takas edin. A-TAKASA güvencesiyle hızlı ve kolay takas.",
    keywords: ["takas", "takas ilanları", "ürün takas", "güvenli takas", "takas yap", "takas sitesi Türkiye"],
  },
  "ikinci-el": {
    ad: "İkinci El İlanları",
    aciklama: "Türkiye'nin en büyük ikinci el pazar yeri. Sıfır fiyatına ikinci el ürünler — telefon, araba, mobilya, giyim. A-TAKASA'da güvenle al sat.",
    keywords: ["ikinci el", "ikinci el satılık", "2. el ürünler", "ikinci el telefon", "ikinci el araba", "ikinci el eşya"],
  },
  "urun-satis": {
    ad: "Satılık Ürünler",
    aciklama: "Sıfır ve ikinci el ürünlerinizi A-TAKASA'da kolayca satın. Binlerce alıcıya ulaşın, hızlı satış yapın.",
    keywords: ["satılık ürün", "ürün sat", "online satış", "ürün satma sitesi"],
  },
  "elektronik": {
    ad: "Elektronik İlanları",
    aciklama: "Telefon, bilgisayar, tablet, TV — elektronik ürünleri sat veya takas et. A-TAKASA'da güvenli elektronik alışveriş.",
    keywords: ["elektronik satılık", "ikinci el telefon", "telefon takas", "laptop satılık", "tablet satılık"],
  },
  "moda": {
    ad: "Giyim & Moda İlanları",
    aciklama: "İkinci el giyim, saat, çanta ve aksesuar ilanları. Modayı takas et, dolaplarını yenile. A-TAKASA Moda kategorisi.",
    keywords: ["ikinci el giyim", "kıyafet takas", "giyim satılık", "marka kıyafet ikinci el"],
  },
  "antika": {
    ad: "Antika & Koleksiyon",
    aciklama: "Antika eserler, el sanatları ve koleksiyon ürünleri. Değerli parçaları güvenle al ve sat. A-TAKASA Antika.",
    keywords: ["antika satılık", "antika takas", "koleksiyon ürünleri", "el sanatları satılık"],
  },
  "petshop": {
    ad: "Petshop & Evcil Hayvan",
    aciklama: "Evcil hayvan ilanları, mama, aksesuar ve veteriner hizmetleri. A-TAKASA Petshop kategorisi.",
    keywords: ["evcil hayvan satılık", "köpek satılık", "kedi satılık", "petshop ilanları"],
  },
  "kitap": {
    ad: "Kitap İlanları",
    aciklama: "İkinci el kitap al sat takas. Ders kitabı, roman, dergiler ve daha fazlası. A-TAKASA Kitap kategorisi.",
    keywords: ["ikinci el kitap", "kitap takas", "kitap satılık", "ders kitabı satılık"],
  },
  "hizmet": {
    ad: "Hizmet İlanları",
    aciklama: "Freelance ve profesyonel hizmet ilanları. Temizlik, taşıma, onarım ve daha fazlası. A-TAKASA Hizmet.",
    keywords: ["hizmet ilanları", "freelance iş", "taşıma hizmeti", "temizlik hizmeti"],
  },
  "kiralama": {
    ad: "Kiralık İlanlar",
    aciklama: "Araç, ekipman ve daha fazlasını günlük veya aylık kiraya verin ya da kiralayın. A-TAKASA Kiralama.",
    keywords: ["kiralık", "araç kiralama", "ekipman kiralama", "günlük kiralık"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const kat = KATEGORILER[params.slug];
  if (!kat) return { title: "Kategori Bulunamadı | A-TAKASA" };

  return {
    title: `${kat.ad} — Güvenli Al Sat Takas | A-TAKASA`,
    description: kat.aciklama,
    keywords: kat.keywords,
    openGraph: {
      title: `${kat.ad} | A-TAKASA`,
      description: kat.aciklama,
      url: `https://atakasa.com/kategori/${params.slug}`,
      images: [{ url: "https://atakasa.com/og-default.jpg", width: 1200, height: 630 }],
    },
    alternates: { canonical: `https://atakasa.com/kategori/${params.slug}` },
  };
}

export function generateStaticParams() {
  return Object.keys(KATEGORILER).map((slug) => ({ slug }));
}

export default function KategoriPage({ params }: Props) {
  const kat = KATEGORILER[params.slug];
  if (!kat) return notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://atakasa.com" },
      { "@type": "ListItem", position: 2, name: kat.ad, item: `https://atakasa.com/kategori/${params.slug}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${kat.ad} — A-TAKASA`,
    description: kat.aciklama,
    url: `https://atakasa.com/kategori/${params.slug}`,
    breadcrumb: breadcrumbSchema,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 120px", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
        <nav style={{ fontSize: 12, color: "#8097b1", marginBottom: 24, display: "flex", gap: 8 }}>
          <a href="/" style={{ color: "#8097b1", textDecoration: "none" }}>Ana Sayfa</a>
          <span>›</span>
          <span>{kat.ad}</span>
        </nav>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f2540", marginBottom: 8, fontFamily: "var(--font-playfair, serif)" }}>
          {kat.ad}
        </h1>
        <p style={{ color: "#8097b1", marginBottom: 32, fontSize: 14, maxWidth: 600 }}>{kat.aciklama}</p>

        {/* İlan listesi buraya gelecek — mevcut listing component'inizi kullanın */}
        <div id="ilan-listesi">
          <p style={{ color: "#0f2540", fontWeight: 600 }}>İlanlar yükleniyor...</p>
        </div>

        {/* SEO İçerik Bloğu — Alt kısım, Google tarafından okunur */}
        <div style={{ marginTop: 64, padding: "32px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e8edf3" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f2540", marginBottom: 16 }}>
            {kat.ad} Hakkında
          </h2>
          <p style={{ color: "#5a6a7e", lineHeight: 1.8, fontSize: 14 }}>
            {kat.aciklama} A-TAKASA'nın güvenli alışveriş altyapısı sayesinde tüm işlemleriniz koruma altındadır.
            Ödeme, ürün teslim edilene kadar güvenli havuzda bekler. Türkiye'nin 81 ilinden binlerce kullanıcı
            A-TAKASA'da güvenle alışveriş yapmaktadır.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
            {kat.keywords.map((kw) => (
              <a key={kw} href={`/kesfet?q=${encodeURIComponent(kw)}`}
                style={{ padding: "6px 14px", background: "#fff", border: "1px solid #e8edf3", borderRadius: 999, fontSize: 12, color: "#0f2540", textDecoration: "none", fontWeight: 600 }}>
                {kw}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
