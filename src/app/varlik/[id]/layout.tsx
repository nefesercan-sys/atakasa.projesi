import type { Metadata } from "next";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

// 🚀 VERCEL'in önbelleğini iptal eder, Google ve WhatsApp'a hep güncel veriyi verir
export const dynamic = "force-dynamic";

// 🎯 DİNAMİK META ETİKET ÜRETİCİSİ (FULL SEO & SOSYAL MEDYA MOTORU)
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const varsayilanResim = "https://atakasa.com/og-image.jpg"; // Sitenin ana logosu

  try {
    await connectMongoDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // İlanı şimşek gibi çek (Kategori bilgisi de SEO için eklendi)
    const ilan = await Varlik.findById(id).select("baslik title aciklama description resimler images image kategori").lean() as any;

    if (!ilan) {
      return {
        title: "Ürün Bulunamadı | At takasa.com",
        description: "Aradığınız ürün borsadan kaldırılmış veya satılmış olabilir.",
        robots: { index: false, follow: false } // Boş sayfayı Google'a dizinletme!
      };
    }

    const baslik = ilan.baslik || ilan.title || "İsimsiz Ürün";
    const aciklama = ilan.aciklama || ilan.description || "Zararına satma, At takasa! Bu eşsiz ürünü hemen incele.";
    const kategori = ilan.kategori || "Takas Fırsatı";
    
    // 🚨 1. ADIM: İLK RESMİ AL
    let resimUrl = ilan.resimler?.[0] || ilan.images?.[0] || ilan.image || varsayilanResim;
    
    // 🚨 2. ADIM: VİDEO VE BOZUK LİNK KONTROLÜ
    if (
      typeof resimUrl === "string" && 
      (resimUrl.includes(".mp4") || resimUrl.includes(".webm") || resimUrl.includes(".mov") || resimUrl.startsWith("data:image"))
    ) {
        resimUrl = varsayilanResim; 
    } else if (typeof resimUrl === "string" && resimUrl.startsWith("http:")) {
        // WhatsApp sadece HTTPS kabul eder!
        resimUrl = resimUrl.replace("http:", "https:");
    }

    // 🚨 3. ADIM: CLOUDINARY SIKIŞTIRMA HİLESİ (WhatsApp için 300KB altına düşürür)
    if (typeof resimUrl === "string" && resimUrl.includes("res.cloudinary.com") && resimUrl.includes("/upload/")) {
        // Resmi 800x800'e kırpar, kalitesini %70 yapar, formatını JPG'ye zorlar
        resimUrl = resimUrl.replace("/upload/", "/upload/c_fill,w_800,h_800,f_jpg,q_70/");
    }

    // Ek güvenlik: Link http ile başlamıyorsa çöktürmemek için ana logoyu bas
    if (typeof resimUrl === "string" && !resimUrl.startsWith("http")) {
        resimUrl = varsayilanResim;
    }

    // 🚀 DİNAMİK SEO ANAHTAR KELİMELERİ (Google için "ürün", "ilan" eklendi)
    const dinamikKeywords = [
      baslik, kategori, "takas", "ikinci el", "at takasa", "güvenli ticaret", "barter", "ürün", "ilan", "takasla"
    ].join(", ");

    return {
      metadataBase: new URL("https://atakasa.com"), // 🚨 İŞTE WHATSAPP'IN ZORUNLU İSTEDİĞİ KÖK URL
      title: `${baslik} | At takasa.com`,
      description: aciklama,
      keywords: dinamikKeywords, // 🎯 GOOGLE ANAHTAR KELİMELERİ
      alternates: {
        canonical: `/varlik/${id}`, // 🎯 GOOGLE KOPYA İÇERİK KORUMASI
      },
      robots: {
        index: true,
        follow: true, // 🎯 GOOGLE BOTLARINA İZİN VER
        "max-image-preview": "large",
      },
      openGraph: {
        title: `${baslik} | At takasa.com`,
        description: aciklama,
        url: `/varlik/${id}`,
        siteName: "At takasa",
        images: [
          {
            url: resimUrl,
            width: 800,
            height: 800,
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
      metadataBase: new URL("https://atakasa.com"),
      title: "At takasa.com | Türkiye'nin Takas Platformu",
      description: "Zararına satma, At takasa!",
      robots: { index: true, follow: true }
    };
  }
}

// 🛡️ SİBER SAYFAYI İÇİNE ALAN ANA İSKELET
export default function VarlikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
