import Link from "next/link";
import { KATEGORILER } from "@/lib/kategoriler";

export const metadata = { title: "Sayfa bulunamadı", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl space-y-4 py-10 text-center">
      <h1 className="text-3xl font-bold">Aradığın sayfa bulunamadı</h1>
      <p className="text-gray-600">İlan kaldırılmış ya da adres değişmiş olabilir. Takas ilanlarına buradan göz atabilirsin.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {KATEGORILER.slice(0, 8).map((k) => (
          <Link key={k.slug} href={`/kategori/${k.slug}`} className="kart px-3 py-1.5 text-sm hover:bg-marka-acik">{k.emoji} {k.ad}</Link>
        ))}
      </div>
      <Link href="/" className="btn">Ana sayfaya dön</Link>
    </div>
  );
}
