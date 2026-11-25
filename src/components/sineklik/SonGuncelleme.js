"use client";
// Sayfanın altında görünen "Son güncelleme" satırı. Tarih src/lib/lastmod.json'dan (gerçek içerik değişikliği; scripts/lastmod.mjs).
// İlk HTML'de sunucuda basılır; data-lastmod: scripts/lastmod.mjs bu satırı içerik özetine katmaz.
import { usePathname } from "next/navigation";
import { lastMod } from "@/lib/lastmod";

const LABEL = {
  tr: ["Son güncelleme", "tr-TR"], en: ["Last updated", "en-GB"], de: ["Zuletzt aktualisiert", "de-DE"], ru: ["Обновлено", "ru-RU"],
  es: ["Última actualización", "es-ES"], fr: ["Dernière mise à jour", "fr-FR"], pl: ["Ostatnia aktualizacja", "pl-PL"],
  uk: ["Оновлено", "uk-UA"], nl: ["Laatst bijgewerkt", "nl-NL"], ar: ["آخر تحديث", "ar"],
};

export default function SonGuncelleme({ lang }) {
  const d = lastMod(usePathname() || "/");
  if (!d) return null;
  const [label, locale] = LABEL[lang] || LABEL.tr;
  let text = d;
  try { text = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)); } catch {}
  return (
    <p data-lastmod="" className="max-w-3xl mx-auto px-4 pb-24 text-xs text-slate-500">
      {label}: <time dateTime={d} suppressHydrationWarning>{text}</time>
    </p>
  );
}
