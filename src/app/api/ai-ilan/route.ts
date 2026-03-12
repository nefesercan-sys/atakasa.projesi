import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// 🚨 SİBER ZIRH: Atakasa (Takas) Kategorileri ve Uygun Resim Kelimeleri
const KATEGORI_BILGI: Record<string, { ad: string; ornekler: string[]; resimKelimeleri: string }> = {
  vasita: { ad: 'Vasıta & Araç', ornekler: ['otomobil', 'motosiklet', 'karavan', 'ticari araç'], resimKelimeleri: 'car,vehicle,motorcycle' },
  elektronik: { ad: 'Elektronik', ornekler: ['akıllı telefon', 'laptop', 'oyun konsolu', 'tablet'], resimKelimeleri: 'smartphone,laptop,playstation' },
  emlak: { ad: 'Emlak', ornekler: ['daire', 'arsa', 'yazlık', 'tarla'], resimKelimeleri: 'house,apartment,realestate' },
  giyim: { ad: 'Saat & Giyim', ornekler: ['akıllı saat', 'marka çanta', 'koleksiyon ayakkabı'], resimKelimeleri: 'watch,sneakers,bag' },
  mobilya: { ad: 'Mobilya', ornekler: ['koltuk takımı', 'antika dolap', 'yemek masası'], resimKelimeleri: 'furniture,sofa,antique' },
  hobi: { ad: 'Hobi & Müzik', ornekler: ['elektro gitar', 'dijital piyano', 'kamp çadırı', 'bisiklet'], resimKelimeleri: 'guitar,bicycle,tent' },
  diger: { ad: 'Diğer Her Şey', ornekler: ['koleksiyon parası', 'spor aleti', 'evcil hayvan eşyası'], resimKelimeleri: 'collection,gym,items' }
};

const SEHIRLER = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri'];

export async function POST(req: NextRequest) {
  try {
    // sektorId yerine kategoriId kullanıyoruz ama gelen isteğe göre esnek bıraktık
    const { kategoriId, sektorId, sehir, adet = 5, adminKey } = await req.json();
    const aktifKategoriId = kategoriId || sektorId; // İki türlü isimlendirmeye de uysun

    // 1. Admin Anahtarı Kontrolü
    if (adminKey !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
      return NextResponse.json({ success: false, error: 'Siber Anahtar (Admin Key) yanlış veya eksik!' }, { status: 401 });
    }

    if (!aktifKategoriId || !KATEGORI_BILGI[aktifKategoriId]) {
      return NextResponse.json({ success: false, error: 'Geçersiz kategori seçimi.' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Vercel ortam değişkenlerinde ANTHROPIC_API_KEY eksik!' }, { status: 500 });
    }

    const kategori = KATEGORI_BILGI[aktifKategoriId];
    const hedefSehir = sehir || SEHIRLER[Math.floor(Math.random() * SEHIRLER.length)];

    // 🚨 TAKAS ODAKLI YENİ SİBER YAPAY ZEKA BEYNİ (PROMPT)
    const prompt = `Sen Atakasa adlı bir takas platformunda elindeki ürünü başka şeylerle takas etmek (değiştirmek) isteyen bir Türk kullanıcısın.
${hedefSehir} şehrinde "${kategori.ad}" kategorisinde (örneğin: ${kategori.ornekler.join(', ')} gibi) elindeki bir eşya için ${adet} adet FARKLI takas ilanı oluştur.

Her ilan için şu JSON formatını kullan:
{
  "baslik": "kısa, dikkat çekici başlık (örn: 'Takaslık temiz iPhone 13' veya 'Üste para alacağım araçla takaslı Arsa')",
  "aciklama": "elindeki ürünün durumu, neden takaslamak istediği ve karşılığında ne tür eşyalar/araçlar beklediğini anlatan detaylı, samimi bir açıklama (100-150 kelime)",
  "tahminiDeger": sayı (elindeki eşyanın tahmini TL değeri, sadece rakam),
  "takasTalebi": "ne tür şeylerle takas olur (örn: 'Sadece otomatik vites araçlar' veya 'Üste para vereceğim telefonlar')",
  "sehir": "${hedefSehir}",
  "ilce": "rastgele gerçek ilçe adı"
}

SADECE JSON array döndür:
[{...}, {...}]`;

    // 2. Kusursuz Çalışan Amiral Gemisi Claude Motoruna İstek Atma
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // BİZİ HİÇ YARI YOLDA BIRAKMAYAN O SİBER MOTOR!
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const claudeData = await claudeRes.json();

    if (!claudeRes.ok) {
      const hataMesaji = claudeData.error?.message || 'Bilinmeyen Anthropic Hatası';
      return NextResponse.json({ 
        success: false, 
        error: `Claude Reddedildi: ${hataMesaji}` 
      }, { status: 400 });
    }

    // 3. Gelen JSON Verisini Ayrıştırma
    const metin = claudeData.content?.[0]?.text || '[]';
    const temizMetin = metin.replace(/```json|```/g, '').trim();
    let uretilen;
    
    try {
      uretilen = JSON.parse(temizMetin);
    } catch (parseError) {
      return NextResponse.json({ success: false, error: 'Yapay Zeka JSON formatını bozdu. Tekrar deneyin.' }, { status: 500 });
    }

    if (!Array.isArray(uretilen)) {
      return NextResponse.json({ success: false, error: 'Yapay Zeka dizi formatında cevap vermedi.' }, { status: 500 });
    }

    const db = await getDb();
    
    // 📸 TAKAS ODAKLI DİNAMİK RESİM MOTORU
    const kayitlar = uretilen.map((ilan: any, index: number) => {
      const randomId = Math.floor(Math.random() * 10000) + index;
      const dinamikResimUrl = `https://loremflickr.com/800/600/${kategori.resimKelimeleri}?lock=${randomId}`;

      return {
        kategoriId: aktifKategoriId, // Takas sitesinde muhtemelen kategoriId olarak geçiyordur
        sektorId: aktifKategoriId, // DB yapını bozmamak için ikisini de ekledim
        baslik: ilan.baslik,
        formData: {
          aciklama: ilan.aciklama,
          sehir: ilan.sehir,
          ilce: ilan.ilce,
          takasTalebi: ilan.takasTalebi, // Takasa özel alan
        },
        medyalar: [dinamikResimUrl], // Şimşek gibi yüklenen dinamik resim
        fiyat: ilan.tahminiDeger, // Takaslık eşyanın tahmini değeri
        butceMin: ilan.tahminiDeger, // Eski sisteme uyum sağlaması için
        butceMax: ilan.tahminiDeger,
        butceBirimi: '₺',
        durum: 'aktif',
        teklifSayisi: 0,
        goruntulenme: Math.floor(Math.random() * 200) + 20,
        teklifeAcik: true,
        gizliAd: false, // Takas ilanlarında genelde isim gizlenmez
        yapay: true,
        sahibi: {
          email: 'sistem@atakasa.com',
          ad: 'Atakasa AI',
          resim: null,
        },
        createdAt: new Date(),
        guncellendi: new Date(),
      };
    });

    const result = await db.collection('ilanlar').insertMany(kayitlar);

    return NextResponse.json({
      success: true,
      uretilen: kayitlar.length,
      ids: Object.values(result.insertedIds).map(id => id.toString()),
    });

  } catch (error: any) {
    console.error('AI ilan üretim hatası:', error);
    return NextResponse.json({ success: false, error: `Sistem Hatası: ${error.message}` }, { status: 500 });
  }
}
