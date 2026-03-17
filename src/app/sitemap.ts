import { MetadataRoute } from 'next';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://atakasa.com';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
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
    },
  ];

  try {
    // ✅ Dinamik import — build sırasında mongoose yüklenmez
    const { connectMongoDB } = await import('../lib/mongodb');
    const VarlikModule = await import('../models/Varlik');
    const Varlik = VarlikModule.default;

    await connectMongoDB();
    const ilanlar = await Varlik.find({}).select('_id updatedAt createdAt').lean() as any[];

    const ilanUrls: MetadataRoute.Sitemap = ilanlar.map((ilan) => ({
      url: `${baseUrl}/varlik/${ilan._id.toString()}`,
      lastModified: ilan.updatedAt || ilan.createdAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    return [...staticPages, ...ilanUrls];
  } catch (error) {
    console.error("Sitemap hatası:", error);
    return staticPages;
  }
}
