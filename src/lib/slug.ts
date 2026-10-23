import crypto from "crypto";
const TR: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u" };
export function ilanSlug(baslik: string): string {
  const t = baslik.replace(/[çğıöşüÇĞİIÖŞÜ]/g, (c) => TR[c]).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
  return `${t || "ilan"}-${crypto.randomBytes(3).toString("hex")}`;
}
