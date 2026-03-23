// src/app/api/varlik-ekle/route.ts
// Yeni ilan eklendiğinde IndexNow ile Bing/Google'a anında bildirim gönderir

import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import { indexNowIlan } from "@/lib/indexNow";

export const dynamic = "force-dynamic";

// Türkçe karakterleri slug'a çevir
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  try {
    await connectMongoDB();
    const data = await req.json();

    // Zorunlu alan kontrolü
    if (!data.baslik || !data.baslik.trim()) {
      return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 });
    }
    if (!data.kategori) {
      return NextResponse.json({ error: "Kategori zorunludur." }, { status: 400 });
    }
    if (!data.sehir) {
      return NextResponse.json({ error: "Şehir zorunludur." }, { status: 400 });
    }
    if (!data.sellerEmail && !data.saticiEmail) {
      return NextResponse.json({ error: "Satıcı bilgisi eksik." }, { status: 400 });
    }

    // Unique slug oluştur
    const baseSlug = slugify(data.baslik);
    const timestamp = Date.now().toString(36); // kısa timestamp
    const slug = `${baseSlug}-${timestamp}`;

    // İlanı kaydet
    const yeniIlan = await Varlik.create({
      baslik:       data.baslik.trim(),
      fiyat:        Number(data.fiyat) || 0,
      eskiFiyat:    Number(data.fiyat) || 0,
      kategori:     data.kategori,
      sektor:       data.sektor || data.kategori,
      altKategori:  data.altKategori || "",
      ulke:         data.ulke || "Türkiye",
      sehir:        data.sehir,
      ilce:         data.ilce || "",
      mahalle:      data.mahalle || "",
      aciklama:     data.aciklama || "",
      takasIstegi:  !!data.takasIstegi,
      resimler:     Array.isArray(data.resimler) ? data.resimler : [],
      ozelAlanlar:  data.ozelAlanlar || {},
      slug,
      satici:       data.satici || data.sellerEmail,
      sellerEmail:  data.sellerEmail || data.satici,
      saticiEmail:  data.saticiEmail || data.sellerEmail,
      durum:        "aktif",
      createdAt:    new Date(),
      updatedAt:    new Date(),
    });

    // ✅ IndexNow — Bing ve Google'a anında bildirim
    // await beklemeden arka planda çalıştır (kullanıcıyı yavaşlatma)
    indexNowIlan(slug).catch(err => console.error("IndexNow hatası:", err));

    return NextResponse.json(
      {
        message: "İlan yayınlandı!",
        id: yeniIlan._id.toString(),
        slug: yeniIlan.slug,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("varlik-ekle hatası:", error);

    // MongoDB duplicate key hatası
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Bu ilan zaten mevcut." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "İlan eklenemedi. Tekrar deneyin." },
      { status: 500 }
    );
  }
}
