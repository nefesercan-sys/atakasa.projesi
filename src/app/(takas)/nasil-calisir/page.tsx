import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Sss from "@/components/Sss";
import { GENEL_SSS } from "@/lib/sss";
export const metadata: Metadata = { title: "Nasıl Çalışır?", description: "A-Takasa'da ilan ver, teklif al, karşılıklı onayla takas et. Tamamen ücretsiz, satış yok.", alternates: { canonical: "/nasil-calisir" } };

const ADIM = [
  ["1. Üye ol", "Ücretsiz üye ol. Telefon numaran yalnızca takas kabul edilince karşı tarafa görünür."],
  ["2. İlan ver", "İhtiyacın olmayan eşyanın fotoğraf veya videosunu yükle, karşılığında ne istediğini yaz."],
  ["3. Teklif ver", "Beğendiğin ilanda 'Takas teklif et' de ve karşılığında kendi ilanlarından birini öner."],
  ["4. Kabul et", "İlan sahibi teklifi kabul ederse iki ilan 'takasta' olur ve iletişim bilgileri açılır."],
  ["5. Buluş ve onayla", "Eşyaları yüz yüze teslim edin; ikiniz de 'Takas gerçekleşti' onayını verince takas tamamlanır."],
];

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "HowTo", name: "A-Takasa'da eşya takası nasıl yapılır?", inLanguage: "tr", step: ADIM.map(([b, a]) => ({ "@type": "HowToStep", name: b.replace(/^\d+\.\s*/, ""), text: a })) }} />
      <h1 className="text-2xl font-bold">Nasıl çalışır?</h1>
      {ADIM.map(([b, a]) => (
        <div key={b} className="kart p-4"><h2 className="font-semibold text-marka-koyu">{b}</h2><p className="text-gray-700">{a}</p></div>
      ))}
      <div className="kart bg-yellow-50 p-4 text-sm text-gray-700">
        <b>Güvenlik:</b> Eşyaları kalabalık, güvenli bir yerde teslim alın; ürünü görmeden ve kontrol etmeden onay vermeyin. A-Takasa şimdilik tamamen ücretsizdir ve para transferi yapılmaz.
      </div>
      <Link href="/ilan-ver" className="btn">Hemen ilan ver</Link>
      <Sss oge={GENEL_SSS} />
    </div>
  );
}
