import { MetadataRoute } from 'next';
import { connectMongoDB } from '../../lib/mongodb';
import Varlik from '../../models/Varlik';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://atakasa.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/kesfet`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
    { url: `${baseUrl}/borsa`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.95 },
    { url: `${baseUrl}/ilan-ver`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/kayit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/giris`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/panel`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];

  let ilanSayfalar: MetadataRoute.Sitemap = [];
  try {
    await connectMongoDB();
    const ilanlar = await Varlik.find({}, { _id: 1, updatedAt: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    ilanSayfalar = ilanlar.map((ilan: any) => ({
      url: `${baseUrl}/varlik/${ilan._id}`,
      lastModified: new Date(ilan.updatedAt || ilan.createdAt || Date.now()),
      changeFrequency: 'daily',
      priority: 0.85,
    }));
  } catch (error) {
    console.error("Sitemap DB hatası:", error);
  }

  return [...staticPages, ...ilanSayfalar];
}
