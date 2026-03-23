import { NextResponse } from "next/server";

const BASE = "https://atakasa.com";

const sayfalar = [
  // Ana sayfalar
  { url: BASE,                              priority: "1.0",  freq: "daily" },
  { url: `${BASE}/kesfet`,                  priority: "0.95", freq: "hourly" },
  { url: `${BASE}/takas`,                   priority: "0.95", freq: "daily" },
  { url: `${BASE}/ilan-ver`,                priority: "0.9",  freq: "monthly" },
  { url: `${BASE}/kayit`,                   priority: "0.85", freq: "monthly" },
  { url: `${BASE}/premium`,                 priority: "0.75", freq: "monthly" },
  { url: `${BASE}/rehber`,                  priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/sss`,                     priority: "0.6",  freq: "monthly" },
  { url: `${BASE}/sozlesme`,                priority: "0.4",  freq: "monthly" },

  // Elektronik
  { url: `${BASE}/kategori/Elektronik`,                    priority: "0.9",  freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - Telefon`,          priority: "0.88", freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - Bilgisayar`,       priority: "0.85", freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - Tablet`,           priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - TV & Monitör`,     priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - Oyun Konsolu`,     priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Elektronik - Kamera`,           priority: "0.75", freq: "weekly" },
  { url: `${BASE}/kategori/Elektronik - Ses Sistemi`,      priority: "0.72", freq: "weekly" },

  // Araç
  { url: `${BASE}/kategori/Araç`,                          priority: "0.9",  freq: "daily" },
  { url: `${BASE}/kategori/Araç - Otomobil`,               priority: "0.88", freq: "daily" },
  { url: `${BASE}/kategori/Araç - Motosiklet`,             priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Araç - SUV & Crossover`,        priority: "0.85", freq: "daily" },
  { url: `${BASE}/kategori/Araç - Ticari Araç`,            priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/Araç - Bisiklet & Scooter`,     priority: "0.72", freq: "weekly" },

  // Emlak
  { url: `${BASE}/kategori/Emlak`,                         priority: "0.9",  freq: "daily" },
  { url: `${BASE}/kategori/Emlak - Satılık Konut`,         priority: "0.88", freq: "daily" },
  { url: `${BASE}/kategori/Emlak - Kiralık Konut`,         priority: "0.88", freq: "daily" },
  { url: `${BASE}/kategori/Emlak - Satılık İşyeri`,        priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Emlak - Arsa & Tarla`,          priority: "0.8",  freq: "weekly" },
  { url: `${BASE}/kategori/Emlak - Villa`,                 priority: "0.78", freq: "weekly" },

  // Diğer kategoriler
  { url: `${BASE}/kategori/Mobilya`,                       priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Oyun/Konsol`,                   priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Antika Eserler`,                priority: "0.78", freq: "weekly" },
  { url: `${BASE}/kategori/Tekstil`,                       priority: "0.8",  freq: "daily" },
  { url: `${BASE}/kategori/Kitap`,                         priority: "0.75", freq: "weekly" },
  { url: `${BASE}/kategori/Kozmetik`,                      priority: "0.75", freq: "weekly" },
  { url: `${BASE}/kategori/Petshop`,                       priority: "0.72", freq: "weekly" },
  { url: `${BASE}/kategori/Makine`,                        priority: "0.75", freq: "weekly" },
  { url: `${BASE}/kategori/El Sanatları`,                  priority: "0.72", freq: "weekly" },
  { url: `${BASE}/kategori/Doğal Ürünler`,                 priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/Oyuncak`,                       priority: "0.7",  freq: "weekly" },
  { url: `${BASE}/kategori/Kırtasiye`,                     priority: "0.65", freq: "weekly" },
  { url: `${BASE}/kategori/2. El`,                         priority: "0.82", freq: "daily" },
  { url: `${BASE}/kategori/Sıfır Ürünler`,                 priority: "0.8",  freq: "daily" },

  // Şehir sayfaları
  { url: `${BASE}/sehir/istanbul`,    priority: "0.92", freq: "daily" },
  { url: `${BASE}/sehir/ankara`,      priority: "0.9",  freq: "daily" },
  { url: `${BASE}/sehir/izmir`,       priority: "0.88", freq: "daily" },
  { url: `${BASE}/sehir/bursa`,       priority: "0.82", freq: "daily" },
  { url: `${BASE}/sehir/antalya`,     priority: "0.82", freq: "daily" },
  { url: `${BASE}/sehir/adana`,       priority: "0.78", freq: "daily" },
  { url: `${BASE}/sehir/konya`,       priority: "0.78", freq: "daily" },
  { url: `${BASE}/sehir/gaziantep`,   priority: "0.76", freq: "daily" },
  { url: `${BASE}/sehir/kayseri`,     priority: "0.75", freq: "daily" },
  { url: `${BASE}/sehir/eskisehir`,   priority: "0.75", freq: "daily" },
  { url: `${BASE}/sehir/mersin`,      priority: "0.73", freq: "daily" },
  { url: `${BASE}/sehir/diyarbakir`,  priority: "0.72", freq: "daily" },
  { url: `${BASE}/sehir/samsun`,      priority: "0.72", freq: "daily" },
  { url: `${BASE}/sehir/trabzon`,     priority: "0.7",  freq: "daily" },
  { url: `${BASE}/sehir/kocaeli`,     priority: "0.72", freq: "daily" },
  { url: `${BASE}/sehir/malatya`,     priority: "0.65", freq: "weekly" },
  { url: `${BASE}/sehir/denizli`,     priority: "0.65", freq: "weekly" },
  { url: `${BASE}/sehir/sakarya`,     priority: "0.65", freq: "weekly" },
  { url: `${BASE}/sehir/balikesir`,   priority: "0.65", freq: "weekly" },
  { url: `${BASE}/sehir/manisa`,      priority: "0.63", freq: "weekly" },
  { url: `${BASE}/sehir/hatay`,       priority: "0.63", freq: "weekly" },
  { url: `${BASE}/sehir/tekirdag`,    priority: "0.63", freq: "weekly" },
  { url: `${BASE}/sehir/mugla`,       priority: "0.63", freq: "weekly" },
  { url: `${BASE}/sehir/aydin`,       priority: "0.62", freq: "weekly" },
  { url: `${BASE}/sehir/canakkale`,   priority: "0.6",  freq: "weekly" },
  { url: `${BASE}/sehir/edirne`,      priority: "0.6",  freq: "weekly" },
  { url: `${BASE}/sehir/rize`,        priority: "0.58", freq: "weekly" },
  { url: `${BASE}/sehir/van`,         priority: "0.58", freq: "weekly" },
  { url: `${BASE}/sehir/erzurum`,     priority: "0.57", freq: "weekly" },
  { url: `${BASE}/sehir/kahramanmaras`, priority: "0.57", freq: "weekly" },
  { url: `${BASE}/sehir/sivas`,       priority: "0.55", freq: "weekly" },
  { url: `${BASE}/sehir/ordu`,        priority: "0.55", freq: "weekly" },

  // Şehir + Kategori kombinasyonları (long-tail SEO)
  { url: `${BASE}/sehir/istanbul?kategori=Elektronik`, priority: "0.85", freq: "daily" },
  { url: `${BASE}/sehir/istanbul?kategori=Araç`,       priority: "0.85", freq: "daily" },
  { url: `${BASE}/sehir/istanbul?kategori=Emlak`,      priority: "0.85", freq: "daily" },
  { url: `${BASE}/sehir/ankara?kategori=Elektronik`,   priority: "0.82", freq: "daily" },
  { url: `${BASE}/sehir/ankara?kategori=Araç`,         priority: "0.82", freq: "daily" },
  { url: `${BASE}/sehir/ankara?kategori=Emlak`,        priority: "0.82", freq: "daily" },
  { url: `${BASE}/sehir/izmir?kategori=Elektronik`,    priority: "0.8",  freq: "daily" },
  { url: `${BASE}/sehir/izmir?kategori=Emlak`,         priority: "0.8",  freq: "daily" },
  { url: `${BASE}/sehir/bursa?kategori=Araç`,          priority: "0.78", freq: "daily" },
  { url: `${BASE}/sehir/antalya?kategori=Emlak`,       priority: "0.78", freq: "daily" },
];

function buildXml(urls: typeof sayfalar) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
}

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(buildXml(sayfalar), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
}
