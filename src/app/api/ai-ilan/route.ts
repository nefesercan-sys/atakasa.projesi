export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
// 🚨 SİBER ZIRH: @/ kısayolu yerine en garanti yöntem olan geriye doğru klasör sayma eklendi!
import { connectMongoDB } from '../../../lib/mongodb';
import Varlik from '../../../models/Varlik';
import mongoose from 'mongoose';

// 📸 Kırık resim hatasını önlemek için NEXT.CONFIG ile uyumlu Unsplash Havuzu
const KATEGORI_BILGI: Record<string, { ad: string; ornekler: string[]; dbKategori: string; resimler: string[] }> = {
  vasita: { 
    ad: 'Vasıta & Araç', ornekler: ['otomobil', 'motosiklet'], dbKategori: 'Vasıta - Otomobil',
    resimler: ['https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80']
  },
  elektronik: { 
    ad: 'Elektronik', ornekler: ['akıllı telefon', 'laptop'], dbKategori: 'Elektronik - Telefon',
    resimler: ['https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80']
  },
  emlak: { 
    ad: 'Emlak', ornekler: ['daire', 'arsa'], dbKategori: 'Emlak - Konut',
    resimler: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80']
  },
  giyim: { 
    ad: 'Saat & Giyim', ornekler: ['akıllı saat', 'marka çanta'], dbKategori: 'Moda - Saat & Takı',
    resimler: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80']
  },
  mobilya: { 
    ad: 'Mobilya', ornekler: ['koltuk takımı', 'yemek masası'], dbKategori: 'Ev - Mobilya & Tekstil',
    resimler: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80']
  },
  hobi: { 
    ad: 'Hobi & Müzik', ornekler: ['elektro gitar', 'bisiklet'], dbKategori: 'Hobi - Oyuncak & Kitap',
    resimler: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80']
  },
  diger: { 
    ad: 'Diğer Her Şey', ornekler: ['spor aleti', 'koleksiyon'], dbKategori: 'Diğer',
    resimler: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80']
  }
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
  "tahminiDeger": sayı (sadece TL değeri, yazısız rakam, örn: 15000),
  "takasTalebi": "ne tür şeylerle takas olur (örn: Sadece otomatik araçlarla)",
  "sehir": "${hedefSehir}",
  "ilce": "rastgele gerçek ilçe adı"
}

SADECE JSON array döndür:
[
  {...},
  {...}
]`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // 🚨 DÜZELTME: Uydurma model yerine gerçek ve hızlı model eklendi!
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

    // MONGOOSE MOTORUNU ÇALIŞTIR
    await connectMongoDB();

    // SİSTEM BOTU BUL/YARAT
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

    // ATAKASA "VARLIK" ŞEMASINA GÖRE VERİLERİ HARMANLA
    const kayitlar = uretilen.map((ilan: any) => {
      // 🚨 DÜZELTME: loremflickr yerine güvenli Unsplash havuzundan resim çekiliyor
      const havuz = kategori.resimler;
      const guvenliResimUrl = havuz[Math.floor(Math.random() * havuz.length)];

      return {
        baslik: ilan.baslik,
        fiyat: Number(ilan.tahminiDeger) || 0,
        eskiFiyat: 0,
        kategori: kategori.dbKategori, 
        ulke: 'Türkiye',
        sehir: ilan.sehir,
        ilce: ilan.ilce || '',
        aciklama: ilan.aciklama,
        takasIstegi: ilan.takasTalebi || 'Tekliflere açık',
        resimler: [guvenliResimUrl], 
        satici: saticiId, 
        aktif: true,
        goruntulenmeSayisi: Math.floor(Math.random() * 200) + 20,
        takasTeklifiSayisi: 0,
        begeniSayisi: 0,
      };
    });

    // VERİTABANINA KAYDET
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
