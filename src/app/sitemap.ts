import { MetadataRoute } from 'next';
import { connectMongoDB } from '../lib/mongodb';
import Varlik from '../models/Varlik';

// 🚀 SİBER KİLİT: Google botları için haritayı canlı tutar
export const dynamic = "force-dynamic";
// 🛡️ ZEKİ ÖNBELLEK: Veritabanını yormamak için haritayı 1 saatte bir arka planda yeniler
export const revalidate = 3600; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://atakasa.com';

  try {
    // Veritabanına şimşek tüneli aç
    await connectMongoDB();

    // ⚡ Bütün ilanları en hızlı şekilde (sadece ID ve Tarih) çek
    // SEO için sadece ID ve güncellenme tarihi yeterlidir, bu sayede 100.000 ilan bile saniyesinde çekilir!
    const ilanlar = await Varlik.find({}).select('_id updatedAt createdAt').lean() as any[];

    // 1. ANA SAYFALAR (Zirve Önceliği)
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'always', // Google'a "Burayı sürekli tara, ana sayfa akışı hep değişiyor" diyoruz
        priority: 1.0, // 🎯 1.0 EN YÜKSEK SEO PUANI
      },
      {
        url: `${baseUrl}/ilan-ver`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/sepet`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      }
    ];

    // 2. DİNAMİK ÜRÜN SAYFALARI (Veritabanından Gelen İlanlar)
    const ilanUrls: MetadataRoute.Sitemap = ilanlar.map((ilan) => ({
      url: `${baseUrl}/varlik/${ilan._id.toString()}`,
      lastModified: ilan.updatedAt || ilan.createdAt || new Date(),
      changeFrequency: 'daily', // İlan fiyatı veya durumu her an değişebilir
      priority: 0.9, // 🎯 Ürün sayfaları SEO'nun kalbidir, yüksek puan veriyoruz!
    }));

    // Bütün haritayı birleştir ve Google'ın önüne ser
    return [...staticPages, ...ilanUrls];

  } catch (error) {
    console.error("Sitemap Motoru Arızası:", error);
    // Hata olursa bile siteyi Google'dan düşürmemek için acil durum haritası ver
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
    ];
  }
}
