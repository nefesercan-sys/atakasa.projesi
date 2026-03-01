import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import cloudinary from '@/utils/cloudinary';

/**
 * GET: Veritabanındaki tüm yayında olan ilanları çeker.
 * Vitrin sayfası bu kanalı kullanarak ilanları listeler.
 */
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("atakasa"); // Atakasa özel veritabanı

    const ilanlar = await db.collection("ilanlar")
      .find({ durum: 'yayinda' })
      .sort({ tarih: -1 }) // En yeni ilan en üstte
      .toArray();

    return NextResponse.json({ success: true, data: ilanlar });
  } catch (error) {
    console.error("GET Hatası:", error);
    return NextResponse.json({ success: false, error: "İlanlar yüklenemedi" }, { status: 500 });
  }
}

/**
 * POST: Yeni ilan verilerini alır, resmi Cloudinary'ye yükler 
 * ve tüm detayları MongoDB'ye mühürler.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("atakasa");

    // 1. Cloudinary'ye Resim Yükleme Operasyonu
    let imageUrl = "";
    if (data.image) {
      const uploadResponse = await cloudinary.uploader.upload(data.image, {
        folder: 'atakasa_urunler', // Atakasa için özel klasör
      });
      imageUrl = uploadResponse.secure_url;
    }

    // 2. MongoDB'ye Kayıt Hazırlığı
    const newIlan = {
      baslik: data.baslik,
      fiyat: Number(data.fiyat),
      kategori: data.kategori,
      altKategori: data.altKategori,
      sehir: data.sehir,
      ilce: data.ilce,
      resimUrl: imageUrl,
      sahibi: data.sahibi || "Misafir Kullanıcı",
      durum: 'yayinda',
      tarih: new Date(),
      // Takas kriterleri için ek alanlar
      fiyatMin: Number(data.fiyat) * 0.7, // %30 ucuz teklif sınırı
    };

    const result = await db.collection("ilanlar").insertOne(newIlan);

    return NextResponse.json({ 
      success: true, 
      message: "İlan siber buluta mühürlendi!",
      id: result.insertedId 
    });

  } catch (error) {
    console.error("POST Hatası:", error);
    return NextResponse.json({ 
      success: false, 
      error: "İlan kayıt işlemi başarısız oldu" 
    }, { status: 500 });
  }
}
