import type { Metadata } from "next";
import Link from "next/link";
import { REHBER } from "@/lib/rehber";

export const metadata: Metadata = {
  title: "Takas Rehberi: Telefon, Araba, Ev, Saat Takası Nasıl Yapılır?",
  description: "Telefon, araba, ev, saat, çakmak ve mobilya takasının nasıl yapıldığını, nelere dikkat edilmesi gerektiğini anlatan ücretsiz takas rehberi.",
  keywords: ["takas rehberi", "takas nasıl yapılır", "güvenli takas", "ikinci el takas", "eşya takası"],
  alternates: { canonical: "/takas-rehberi" },
};

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Takas rehberi</h1>
      <p className="text-gray-700">Hangi eşyayı takas etmek istersen, nasıl ilan vereceğini ve nelere dikkat etmen gerektiğini burada bulabilirsin.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {REHBER.map((r) => (
          <Link key={r.slug} href={`/takas-rehberi/${r.slug}`} className="kart block p-4 hover:bg-marka-acik">
            <h2 className="font-semibold text-marka-koyu">{r.baslik}</h2>
            <p className="mt-1 text-sm text-gray-600">{r.ozet}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
