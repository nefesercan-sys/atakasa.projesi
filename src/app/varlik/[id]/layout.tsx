import type { Metadata } from "next";

// 📡 SİBER RADAR: Gelen ID'ye göre veritabanından ilanı bulur
async function getIlanVerisi(id: string) {
  try {
    // API'nin tam yolunu yazmalısın (Kendi veritabanı url'ni buraya uyarla)
    const res = await fetch(`https://atakasa.com/api/varliklar`, { cache: 'no-store' });
    const data = await res.json();
    let liste = Array.isArray(data) ? data : data.data || data.ilanlar || [];
    const ilan = liste.find((i: any) => i._id === id || i.id === id);
    return ilan;
  } catch (error) {
    return null;
  }
}

// 🎯 DİNAMİK META ETİKET ÜRETİCİSİ (SEO)
export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await params;
  const ilan = await getIlanVerisi(resolvedParams.id);

  if (!ilan) {
    return {
      title: "Varlık Bulunamadı | A-TAKASA",
      description: "Aradığınız siber varlık borsadan kaldırılmış olabilir.",
    };
  }

  // Google'a gösterilecek o kusursuz başlık: (Örn: "iPhone 13 - 128GB | Takas İlanı | A-TAKASA")
  return {
    title: `${ilan.title || ilan.baslik} | Takas İlanı | A-TAKASA`,
    description: ilan.description || ilan.aciklama,
    openGraph: {
      title: `${ilan.title || ilan.baslik} A-TAKASA'da!`,
      description: ilan.description || ilan.aciklama,
      // Resim URL'sini çekiyoruz
      images: [ilan.resimler?.[0] || ilan.images?.[0] || ilan.resim || ilan.image || ilan.gorsel || "https://atakasa.com/logo.png"],
    },
  };
}

// 🛡️ KALKAN: Senin mevcut (use client) page.tsx dosyan bu {children} içine gömülecek
export default function VarlikLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
