import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Sitenin ana siber adresi
  const baseUrl = 'https://atakasa.com';

  return [
    {
      url: baseUrl, // Tek tırnakları tamamen kaldırdık, en güvenli yöntem!
      lastModified: new Date(),
      changeFrequency: 'daily', 
      priority: 1.0, 
    },
    {
      url: baseUrl + '/panel', // Adresi basit artı (+) işlemiyle birleştirdik
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
