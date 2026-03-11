import type { Metadata } from "next";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

// 🚀 VERCEL'in önbelleğini iptal eder, Google ve WhatsApp'a hep güncel veriyi verir
export const dynamic = "force-dynamic";

// 🎯 DİNAMİK META ETİKET ÜRETİCİSİ (FULL SEO & SOSYAL MEDYA MOTORU)
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    await connectMongoDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // İlanı şimşek gibi çek (Kategori bilgisi de SEO için eklendi)
    const ilan = await Varlik.findById(id).select("baslik title aciklama description resimler images image kategori").lean() as any;

    if (!ilan) {
      return {
        title: "Varlık Bulunamadı | At takasa",
        description: "Aradığınız siber varlık borsadan kaldırılmış veya satılmış olabilir.",
        robots: { index: false, follow: false } // Boş sayfayı Google'a dizinletme!
      };
    }

    const baslik = ilan.baslik || ilan.title || "İsimsiz Varlık";
    const aciklama = ilan.aciklama || ilan.description || "Zararına satma, At takasa! Siber terminaldeki bu eşsiz varlığı hemen incele.";
    const kategori = ilan.kategori || "Takas Fırsatı";
    
    // 🚨 RESİM SİBER FİLTRESİ
    let resimUrl = ilan.resimler?.[0] || ilan.images?.[0] || ilan.image || "https://atakasa.com/og-image.jpg";
    
    // Eğer resim VİDEO ise veya BASE64 formatındaysa (Sosyal medya okuyamaz), varsayılan resmi bas!
    if (
      typeof resimUrl === "string" && 
      (resimUrl.includes(".mp4") || resimUrl.includes(".webm") || resimUrl.includes(".mov") || resimUrl.startsWith("data:image"))
    ) {
        resimUrl = "https://atakasa.com/og-image.jpg"; 
    }

    // Ek güvenlik: Link http ile başlamıyorsa çöktürmemek için ana logoyu bas
    if (!resimUrl.startsWith("http")) {
        resimUrl = "https://atakasa.com/og-image.jpg";
    }

    // 🚀 DİNAMİK SEO ANAHTAR KELİMELERİ (Google için)
    const dinamikKeywords = [
      baslik, kategori, "takas", "ikinci el", "at takasa", "güvenli ticaret", "barter", "ücretsiz ilan", "takasla"
    ].join(", ");

    return {
      title: `${baslik} | At takasa.com`,
      description: aciklama,
      keywords: dinamikKeywords, // 🎯 GOOGLE ANAHTAR KELİMELERİ
      alternates: {
        canonical: `https://atakasa.com/varlik/${id}`, // 🎯 GOOGLE KOPYA İÇERİK KORUMASI
      },
      robots: {
        index: true,
        follow: true, // 🎯 GOOGLE BOTLARINA İZİN VER
        "max-image-preview": "large",
      },
      openGraph: {
        title: `${baslik} | At takasa.com`,
        description: aciklama,
        url: `https://atakasa.com/varlik/${id}`,
        siteName: "At takasa",
        images: [
          {
            url: resimUrl,
            width: 1200,
            height: 630,
            alt: baslik,
          }
        ],
        type: "website",
        locale: "tr_TR",
      },
      twitter: {
        card: "summary_large_image",
        title: `${baslik} | At takasa.com`,
        description: aciklama,
        images: [resimUrl],
      },
    };
  } catch (error) {
    return { 
      title: "At takasa.com | Siber Takas Ağı",
      description: "Zararına satma, At takasa!",
      robots: { index: true, follow: true }
    };
  }
}

// 🛡️ SİBER SAYFAYI İÇİNE ALAN ANA İSKELET
export default function VarlikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
