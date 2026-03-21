sitemap-ilanlar.xml/route.ts
urls = (Array.isArray(liste) ? liste : [])
  .filter((v: any) => v.slug)
  .flatMap((v: any) => {
    const base = `${BASE}/varlik/${v.slug}`;
    const mod = new Date(v.updatedAt || v.createdAt || now).toISOString();
    return [
      { loc: base,                  priority: "0.8",  mod },
      { loc: `${base}/takas`,       priority: "0.7",  mod },
      { loc: `${base}/satin-al`,    priority: "0.7",  mod },
      { loc: `${base}/sepet`,       priority: "0.6",  mod },
      { loc: `${base}/paylas`,      priority: "0.65", mod },
    ];
  })
  .map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.mod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`);
