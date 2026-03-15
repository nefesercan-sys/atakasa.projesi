import { MetadataRoute } from 'next';
import { connectMongoDB } from '../lib/mongodb';
import Varlik from '../models/Varlik';

// 🛡️ ZEKİ ÖNBELLEK (SİBER ZIRH): 
// Haritayı hafızaya alır ve botlara saliseler içinde sunar. Veritabanı asla yorulmaz!
// Her 3600 saniyede (1 saat) bir arka planda sessizce yenilenir.
export const revalidate = 3600; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://atakasa.com';

  try {
    // Veritabanına şimşek tüneli aç
    await connectMongoDB();

    // ⚡ Bütün ilanları en hızlı şekilde (sadece ID ve Tarih) çek
    const ilanlar = await Varlik.find({}).select('_id updatedAt createdAt').lean() as any[];

    // 1. ANA SAYFALAR (Zirve Önceliği)
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'always',
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
      changeFrequency: 'daily', 
      priority: 0.9, 
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
