export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/İ/g, "i").replace(/Ğ/g, "g").replace(/Ü/g, "u")
    .replace(/Ş/g, "s").replace(/Ö/g, "o").replace(/Ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export function generateVarlikSlug(
  baslik: string,
  kategori: string,
  sehir: string
): string {
  return slugify(`${baslik} ${sehir} ${kategori}`);
}

export async function generateUniqueSlug(
  baslik: string,
  kategori: string,
  sehir: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = generateVarlikSlug(baslik, kategori, sehir);
  let slug = base;
  let i = 1;
  while (await checkExists(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
