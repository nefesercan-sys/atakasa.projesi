import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import Varlik from '@/models/Varlik';
import mongoose from 'mongoose';

// 🚨 SİBER ZIRH: Atakasa Kategorileri DB'deki Tam İsimlerle Eşleştirildi
const KATEGORI_BILGI: Record<string, { ad: string; ornekler: string[]; resimKelimeleri: string; dbKategori: string }> = {
  vasita: { ad: 'Vasıta & Araç', ornekler: ['otomobil', 'motosiklet'], resimKelimeleri: 'car,vehicle', dbKategori: 'Vasıta - Otomobil' },
  elektronik: { ad: 'Elektronik', ornekler: ['akıllı telefon', 'laptop'], resimKelimeleri: 'smartphone,laptop', dbKategori: 'Elektronik - Telefon' },
  emlak: { ad: 'Emlak', ornekler: ['daire', 'arsa'], resimKelimeleri: 'house,apartment', dbKategori: 'Emlak - Konut' },
  giyim: { ad: 'Saat & Giyim', ornekler: ['akıllı saat', 'marka çanta'], resimKelimeleri: 'watch,sneakers', dbKategori: 'Moda - Saat & Takı' },
  mobilya: { ad: 'Mobilya', ornekler: ['koltuk takımı', 'yemek masası'], resimKelimeleri: 'furniture,sofa', dbKategori: 'Ev - Mobilya & Tekstil' },
  hobi: { ad: 'Hobi & Müzik', ornekler: ['elektro gitar', 'bisiklet'], resimKelimeleri: 'guitar,bicycle', dbKategori: 'Hobi - Oyuncak & Kitap' },
  diger: { ad: 'Diğer Her Şey', ornekler: ['spor aleti', 'koleksiyon'], resimKelimeleri: 'collection,gym', dbKategori: 'Diğer' }
};

const SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri'];

export async function POST(req: NextRequest) {
  try {
    const { kategoriId, sehir, adet = 5, adminKey } = await req.json();

    if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Siber Anahtar (Admin Key) yanlış veya eksik!' }, { status: 401 });
    }

    if (!kategoriId || !KATEGORI_BILGI[kategoriId]) {
      return NextResponse.json({ success: false, error: 'Geçersiz kategori seçimi.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Vercel ortam değişkenlerinde ANTHROPIC_API_KEY eksik!' }, { status: 500 });
    }

    const kategori = KATEGORI_BILGI[kategoriId];
    const hedefSehir = sehir || SEHIRLER[Math.floor(Math.random() * SEHIRLER.length)];

    const prompt = `Sen Atakasa adlı bir takas platformunda elindeki ürünü başka şeylerle takas etmek (değiştirmek) isteyen bir Türk kullanıcısın.
${hedefSehir} şehrinde "${kategori.ad}" kategorisinde (örneğin: ${kategori.ornekler.join(', ')} gibi) elindeki bir eşya için ${adet} adet FARKLI takas ilanı oluştur.

Her ilan için şu JSON formatını kullan:
{
  "baslik": "kısa, dikkat çekici başlık (örn: 'Takaslık temiz iPhone 13')",
  "aciklama": "elindeki ürünün durumu, neden takaslamak istediği ve ne beklediği (100-150 kelime)",
  "tahminiDeger": sayı (sadece TL değeri, yazısız rakam),
  "takasTalebi": "ne tür şeylerle takas olur (örn: Sadece otomatik araçlarla)",
  "sehir": "${hedefSehir}",
  "ilce": "rastgele gerçek ilçe adı"
}

SADECE JSON array döndür:
[{...}, {...}]`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // SENİN AMİRAL GEMİSİ MOTORUN
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json();

    if (!claudeRes.ok) {
      const hataMesaji = claudeData.error?.message || 'Bilinmeyen Anthropic Hatası';
      return NextResponse.json({ success: false, error: `Claude Reddedildi: ${hataMesaji}` }, { status: 400 });
    }

    const metin = claudeData.content?.[0]?.text || '[]';
    const temizMetin = metin.replace(/```json|```/g, '').trim();
    let uretilen;
    
    try {
      uretilen = JSON.parse(temizMetin);
    } catch (parseError) {
      return NextResponse.json({ success: false, error: 'Yapay Zeka JSON formatını bozdu.' }, { status: 500 });
    }

    // 🚨 1. ADIM: MONGOOSE MOTORUNU ÇALIŞTIR
    await connectMongoDB();

    // 🚨 2. ADIM: "SATICI" (USER ID) ZORUNLULUĞUNU AŞMAK İÇİN SİSTEM BOTU BUL/YARAT
    let systemUser = await mongoose.connection.collection('users').findOne({ email: 'sistem@atakasa.com' });
    let saticiId;
    
    if (!systemUser) {
      const insertResult = await mongoose.connection.collection('users').insertOne({
        email: 'sistem@atakasa.com',
        name: 'Atakasa AI',
        image: 'https://ui-avatars.com/api/?name=AI&background=00f260&color=000',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      saticiId = insertResult.insertedId;
    } else {
      saticiId = systemUser._id;
    }

    // 🚨 3. ADIM: ATAKASA "VARLIK" ŞEMASINA GÖRE VERİLERİ HARMANLA
    const kayitlar = uretilen.map((ilan: any, index: number) => {
      const randomId = Math.floor(Math.random() * 10000) + index;
      const dinamikResimUrl = `https://loremflickr.com/800/600/${kategori.resimKelimeleri}?lock=${randomId}`;

      return {
        baslik: ilan.baslik,
        fiyat: ilan.tahminiDeger || 0,
        eskiFiyat: 0,
        kategori: kategori.dbKategori, // Tam DB formatında kategori (Örn: "Vasıta - Otomobil")
        ulke: 'Türkiye',
        sehir: ilan.sehir,
        ilce: ilan.ilce,
        aciklama: ilan.aciklama,
        takasIstegi: ilan.takasTalebi,
        resimler: [dinamikResimUrl], // Dinamik resim motoru
        satici: saticiId, // Yukarıda ürettiğimiz geçerli ObjectId
        aktif: true,
        goruntulenmeSayisi: Math.floor(Math.random() * 200) + 20,
        takasTeklifiSayisi: 0,
        begeniSayisi: 0,
      };
    });

    // 🚨 4. ADIM: VERİTABANINA KAYDET
    const result = await Varlik.insertMany(kayitlar);

    return NextResponse.json({
      success: true,
      uretilen: kayitlar.length,
      ids: result.map(r => r._id.toString()),
    });

  } catch (error: any) {
    console.error('AI varlık üretim hatası:', error);
    return NextResponse.json({ success: false, error: `Sistem Hatası: ${error.message}` }, { status: 500 });
  }
}
