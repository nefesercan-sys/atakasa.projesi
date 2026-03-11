import type { Metadata } from "next";
import { connectMongoDB } from "../../../../lib/mongodb";
import Varlik from "../../../../models/Varlik";

// 🚀 VERCEL'in önbelleğini iptal eder, WhatsApp'a hep güncel veriyi verir
export const dynamic = "force-dynamic";

// 🎯 DİNAMİK META ETİKET ÜRETİCİSİ (SEO & WHATSAPP)
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  try {
    // API'yi beklemek yerine DOĞRUDAN veritabanına tünel açıyoruz (Saniyenin onda biri sürer!)
    await connectMongoDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Sadece WhatsApp'a göstermek için ilgili ilanı saniyesinde çekiyoruz
    const ilan = await Varlik.findById(id).select("baslik title aciklama description resimler images image").lean() as any;

    if (!ilan) {
      return {
        title: "Varlık Bulunamadı | At takasa.com",
        description: "Aradığınız siber varlık borsadan kaldırılmış olabilir.",
      };
    }

    const baslik = ilan.baslik || ilan.title || "İsimsiz Varlık";
    const aciklama = ilan.aciklama || ilan.description || "Zararına satma, At takasa! Siber terminaldeki bu eşsiz varlığı hemen incele.";
    
    // İlk medyayı yakalıyoruz
    let resimUrl = ilan.resimler?.[0] || ilan.images?.[0] || ilan.image || "https://atakasa.com/og-image.jpg";
    
    // 🚨 SİBER HİLE: Sosyal medya botları mp4/video oynatamaz ve resmi boş bırakır! 
    // Eğer ilk medya video ise, varsayılan Atakasa resmini basıyoruz.
    if (typeof resimUrl === "string" && (resimUrl.includes(".mp4") || resimUrl.includes(".webm") || resimUrl.includes(".mov"))) {
        resimUrl = "https://atakasa.com/og-image.jpg"; 
    }

    return {
      title: `${baslik} | At takasa.com`,
      description: aciklama,
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
      description: "Zararına satma, At takasa!"
    };
  }
}

// 🛡️ SİBER SAYFAYI İÇİNE ALAN ANA İSKELET
export default function VarlikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
