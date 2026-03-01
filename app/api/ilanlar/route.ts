import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import cloudinary from '@/utils/cloudinary';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("atakasa"); // Nexus'tan farklı olarak Atakasa veritabanı

    // 1. Cloudinary'ye Resim Yükleme (Base64 formatında gelirse)
    const uploadResponse = await cloudinary.uploader.upload(data.image, {
      folder: 'atakasa_urunler',
    });

    // 2. MongoDB'ye İlanı Kaydetme
    const newIlan = {
      baslik: data.baslik,
      fiyat: Number(data.fiyat),
      kategori: data.kategori,
      altKategori: data.altKategori,
      sehir: data.sehir,
      ilce: data.ilce,
      resimUrl: uploadResponse.secure_url, // Buluttaki resim linki
      sahibi: data.sahibi, // Kullanıcı ID'si
      durum: 'yayinda',
      tarih: new Date(),
    };

    const result = await db.collection("ilanlar").insertOne(newIlan);

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Siber Hata:", error);
    return NextResponse.json({ success: false, error: "İlan kaydedilemedi" }, { status: 500 });
  }
}
