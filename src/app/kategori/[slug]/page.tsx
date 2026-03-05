"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function KategoriSayfasi() {
  const { slug } = useParams();
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const veriGetir = async () => {
      try {
        const res = await fetch("/api/varliklar");
        const data = await res.json();
        // Sadece bu kategoriye (slug) ait olanları filtrele
        const filtrelenmis = data.filter((i: any) => 
          i.kategori?.toLowerCase().replace(/\s+/g, '-') === slug
        );
        setIlanlar(filtrelenmis);
      } catch (err) {
        console.error("Kategori verisi çekilemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    veriGetir();
  }, [slug]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">
        Sektör: <span className="text-[#00f260]">{slug?.toString().replace('-', ' ')}</span>
      </h1>

      {loading ? (
        <div className="animate-pulse flex gap-4">SİNYAL ARANIYOR...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ilanlar.length > 0 ? ilanlar.map((ilan) => (
            <Link key={ilan._id} href={`/varlik/${ilan._id}`} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden p-3">
              <img src={ilan.resimler?.[0]} className="h-48 w-full object-cover rounded-[1.5rem]" />
              <div className="p-4">
                <h3 className="font-bold text-lg">{ilan.baslik}</h3>
                <p className="text-[#00f260] font-black">{ilan.fiyat.toLocaleString()} ₺</p>
              </div>
            </Link>
          )) : (
            <p className="opacity-30 uppercase font-bold tracking-widest text-xs">Bu sektörde henüz varlık yok.</p>
          )}
        </div>
      )}
    </div>
  );
}
