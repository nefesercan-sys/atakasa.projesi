import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Tüm arama motoru botlarına sesleniyoruz (Google, Yandex, Bing)
      allow: '/', // Sitenin geneline girmelerine izin veriyoruz
      disallow: '/panel/', // GİZLİLİK: Kullanıcıların özel paneline botların girmesini yasaklıyoruz!
    },
    sitemap: 'https://atakasa.com/sitemap.xml', // Botlara haritanın yerini gösteriyoruz
  };
}
