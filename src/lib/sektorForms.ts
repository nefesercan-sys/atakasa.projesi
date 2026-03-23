// src/lib/sektorForms.ts
// Her sektör ve alt kategoriye özel form alanları

export type AlanTipi = "text" | "number" | "select" | "multiselect" | "textarea" | "boolean" | "year" | "km";

export interface FormAlani {
  key: string;
  label: string;
  tip: AlanTipi;
  zorunlu?: boolean;
  placeholder?: string;
  secenekler?: string[];
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  ipucu?: string;
}

export interface SektorForm {
  ad: string;
  emoji: string;
  altKategoriler: string[];
  genelAlanlar: FormAlani[];
  altKategoriAlanlari?: Record<string, FormAlani[]>;
}

export const SEKTOR_FORMLARI: Record<string, SektorForm> = {

  // ═══════════════════════════════════════════════════
  // ELEKTRONİK
  // ═══════════════════════════════════════════════════
  "Elektronik": {
    ad: "Elektronik",
    emoji: "💻",
    altKategoriler: ["Telefon", "Bilgisayar", "Tablet", "TV & Monitör", "Ses Sistemi", "Oyun Konsolu", "Kamera", "Beyaz Eşya", "Diğer Elektronik"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Apple, Samsung, Sony" },
      { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: iPhone 15 Pro, Galaxy S24" },
      { key: "durum", label: "Ürün Durumu", tip: "select", zorunlu: true, secenekler: ["Sıfır (Açılmamış)", "Sıfır Gibi", "İkinci El - Çok İyi", "İkinci El - İyi", "İkinci El - Normal", "Hasarlı / Arızalı"] },
      { key: "garantiDurumu", label: "Garanti Durumu", tip: "select", secenekler: ["Garantisi Var", "Garantisi Yok", "Servis Garantisi"] },
      { key: "faturaDurumu", label: "Fatura", tip: "select", secenekler: ["Faturalı", "Faturasız"] },
      { key: "renk", label: "Renk", tip: "text", placeholder: "Örn: Siyah, Beyaz, Uzay Grisi" },
    ],
    altKategoriAlanlari: {
      "Telefon": [
        { key: "depolama", label: "Depolama", tip: "select", zorunlu: true, secenekler: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
        { key: "ram", label: "RAM", tip: "select", secenekler: ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
        { key: "ekranBoyutu", label: "Ekran Boyutu", tip: "text", placeholder: "Örn: 6.1 inç", suffix: "inç" },
        { key: "imei", label: "IMEI Numarası", tip: "text", placeholder: "İsteğe bağlı", ipucu: "Güven için IMEI paylaşmanızı öneririz" },
        { key: "aksesuar", label: "Aksesuarlar", tip: "multiselect", secenekler: ["Orijinal Kutu", "Şarj Aleti", "Kulaklık", "Kılıf", "Ekran Koruyucu"] },
      ],
      "Bilgisayar": [
        { key: "islemci", label: "İşlemci", tip: "text", zorunlu: true, placeholder: "Örn: Intel i7-12700H, AMD Ryzen 7" },
        { key: "ram", label: "RAM", tip: "select", zorunlu: true, secenekler: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
        { key: "depolama", label: "Depolama", tip: "select", zorunlu: true, secenekler: ["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "1 TB HDD", "2 TB HDD"] },
        { key: "ekranKarti", label: "Ekran Kartı", tip: "text", placeholder: "Örn: NVIDIA RTX 3060, Entegre" },
        { key: "ekranBoyutu", label: "Ekran Boyutu", tip: "text", placeholder: "Örn: 15.6 inç", suffix: "inç" },
        { key: "isletimSistemi", label: "İşletim Sistemi", tip: "select", secenekler: ["Windows 11", "Windows 10", "macOS", "Linux", "Yok"] },
      ],
      "Tablet": [
        { key: "depolama", label: "Depolama", tip: "select", zorunlu: true, secenekler: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB"] },
        { key: "ekranBoyutu", label: "Ekran Boyutu", tip: "text", placeholder: "Örn: 10.9 inç", suffix: "inç" },
        { key: "baglantilik", label: "Bağlantı", tip: "select", secenekler: ["Yalnızca Wi-Fi", "Wi-Fi + Cellular"] },
        { key: "aksesuar", label: "Aksesuarlar", tip: "multiselect", secenekler: ["Kalem", "Klavye", "Kutu", "Şarj Aleti", "Kılıf"] },
      ],
      "TV & Monitör": [
        { key: "ekranBoyutu", label: "Ekran Boyutu", tip: "number", zorunlu: true, placeholder: "55", suffix: "inç" },
        { key: "cozunurluk", label: "Çözünürlük", tip: "select", secenekler: ["HD (720p)", "Full HD (1080p)", "4K (2160p)", "8K"] },
        { key: "panel", label: "Panel Tipi", tip: "select", secenekler: ["LED", "OLED", "QLED", "IPS", "VA"] },
        { key: "akıllıTv", label: "Akıllı TV", tip: "boolean" },
      ],
      "Kamera": [
        { key: "kameraTipi", label: "Kamera Tipi", tip: "select", zorunlu: true, secenekler: ["DSLR", "Mirrorless", "Kompakt", "Aksiyon Kamera", "Drone", "Analog"] },
        { key: "megapiksel", label: "Megapiksel", tip: "number", placeholder: "24", suffix: "MP" },
        { key: "lensler", label: "Dahil Lensler", tip: "textarea", placeholder: "Hangi lensler dahil?" },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // ARAÇ
  // ═══════════════════════════════════════════════════
  "Araç": {
    ad: "Araç",
    emoji: "🚗",
    altKategoriler: ["Otomobil", "Motosiklet", "SUV / Crossover", "Ticari Araç", "Minibüs / Kamyonet", "Karavan", "Bisiklet / Scooter"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Toyota, BMW, Ford" },
      { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: Corolla, 3 Serisi, Focus" },
      { key: "yil", label: "Model Yılı", tip: "year", zorunlu: true, placeholder: "2020" },
      { key: "km", label: "Kilometre", tip: "km", zorunlu: true, placeholder: "45000", suffix: "km" },
      { key: "yakit", label: "Yakıt Tipi", tip: "select", zorunlu: true, secenekler: ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik", "Benzin + LPG"] },
      { key: "vites", label: "Vites", tip: "select", zorunlu: true, secenekler: ["Manuel", "Otomatik", "Yarı Otomatik", "CVT"] },
      { key: "kasa", label: "Kasa Tipi", tip: "select", secenekler: ["Sedan", "Hatchback", "Station Wagon", "SUV", "Coupe", "Cabrio", "Pickup", "Van"] },
      { key: "renk", label: "Renk", tip: "text", placeholder: "Örn: Beyaz, Siyah, Gümüş" },
      { key: "motorHacmi", label: "Motor Hacmi", tip: "text", placeholder: "Örn: 1.6, 2.0", suffix: "cc" },
      { key: "motorGucu", label: "Motor Gücü", tip: "number", placeholder: "120", suffix: "HP" },
      { key: "cekis", label: "Çekiş", tip: "select", secenekler: ["Önden Çekiş", "Arkadan İtiş", "4x4", "AWD"] },
      { key: "agirTramer", label: "Ağır Hasar / Tramer", tip: "select", zorunlu: true, secenekler: ["Yok", "Var (Açıklama gerekli)"] },
      { key: "boyaBakir", label: "Boya / Değişen", tip: "textarea", placeholder: "Örn: Tüm orijinal, sol arka kapı boyalı..." },
      { key: "ekspertiz", label: "Ekspertiz Durumu", tip: "select", secenekler: ["Ekspertiz Yapılabilir", "Ekspertiz Yapıldı - Temiz", "Ekspertiz Yok"] },
      { key: "takasKabul", label: "Takas Kabul", tip: "boolean" },
      { key: "krediyeUygun", label: "Krediye Uygun", tip: "boolean" },
    ],
    altKategoriAlanlari: {
      "Motosiklet": [
        { key: "motorTipi", label: "Motosiklet Tipi", tip: "select", secenekler: ["Naked", "Sport", "Enduro", "Scooter", "Chopper", "Touring", "Cross"] },
        { key: "motorHacmi", label: "Motor Hacmi", tip: "number", placeholder: "650", suffix: "cc" },
        { key: "ehliyet", label: "Ehliyet Sınıfı", tip: "select", secenekler: ["A1", "A2", "A"] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════
  // EMLAK
  // ═══════════════════════════════════════════════════
  "Emlak": {
    ad: "Emlak",
    emoji: "🏠",
    altKategoriler: ["Satılık Konut", "Kiralık Konut", "Satılık İş Yeri", "Kiralık İş Yeri", "Satılık Arsa", "Satılık Villa", "Devremülk"],
    genelAlanlar: [
      { key: "ilanTipi", label: "İlan Tipi", tip: "select", zorunlu: true, secenekler: ["Satılık", "Kiralık", "Günlük Kiralık"] },
      { key: "emlakTipi", label: "Emlak Tipi", tip: "select", zorunlu: true, secenekler: ["Daire", "Villa", "Müstakil Ev", "Bina", "Yazlık", "Ofis", "Dükkan", "Depo", "Arsa", "Tarla"] },
      { key: "metrekare", label: "Metrekare (m²)", tip: "number", zorunlu: true, placeholder: "120", suffix: "m²" },
      { key: "odaSayisi", label: "Oda Sayısı", tip: "select", zorunlu: true, secenekler: ["Stüdyo", "1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1 ve üzeri"] },
      { key: "kat", label: "Bulunduğu Kat", tip: "select", secenekler: ["Bodrum", "Zemin", "Bahçe", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"] },
      { key: "binaKatSayisi", label: "Binanın Kat Sayısı", tip: "number", placeholder: "5" },
      { key: "banyoSayisi", label: "Banyo Sayısı", tip: "select", secenekler: ["1", "2", "3", "4+"] },
      { key: "isitma", label: "Isıtma", tip: "select", secenekler: ["Merkezi", "Kombi", "Yerden Isıtma", "Klima", "Soba", "Yok"] },
      { key: "yapimYili", label: "Yapım Yılı", tip: "year", placeholder: "2015" },
      { key: "tapu", label: "Tapu Durumu", tip: "select", secenekler: ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Payı", "Hisseli Tapu", "Köy Tapusu"] },
      { key: "aidat", label: "Aidat", tip: "number", placeholder: "500", suffix: "₺/ay" },
      { key: "cephe", label: "Cephe", tip: "multiselect", secenekler: ["Kuzey", "Güney", "Doğu", "Batı", "Sokak", "Bahçe", "Deniz"] },
      { key: "ozellikler", label: "Özellikler", tip: "multiselect", secenekler: ["Asansör", "Otopark", "Güvenlik", "Balkon", "Teras", "Bahçe", "Havuz", "Spor Salonu", "Ebeveyn Banyosu", "Giyinme Odası", "Şömine", "Akıllı Ev"] },
      { key: "esyaDurumu", label: "Eşya Durumu", tip: "select", secenekler: ["Boş", "Beyaz Eşyalı", "Mobilyalı", "Tam Eşyalı"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // MOBİLYA
  // ═══════════════════════════════════════════════════
  "Mobilya": {
    ad: "Mobilya",
    emoji: "🪑",
    altKategoriler: ["Oturma Odası", "Yatak Odası", "Yemek Odası", "Çalışma Masası", "Mutfak", "Banyo", "Çocuk Odası", "Ofis Mobilyası"],
    genelAlanlar: [
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal", "Hasarlı"] },
      { key: "malzeme", label: "Malzeme", tip: "select", secenekler: ["Masif Ahşap", "MDF", "Sunta", "Metal", "Cam", "Kumaş", "Deri", "Plastik"] },
      { key: "renk", label: "Renk / Finish", tip: "text", placeholder: "Örn: Beyaz, Ceviz, Antrasit" },
      { key: "marka", label: "Marka", tip: "text", placeholder: "Örn: İkea, Bellona, İstikbal" },
      { key: "boyutlar", label: "Boyutlar (En x Boy x Yükseklik)", tip: "text", placeholder: "Örn: 200cm x 90cm x 75cm" },
      { key: "demontaj", label: "Demontaj Yapılabilir", tip: "boolean" },
      { key: "nakliye", label: "Nakliye Dahil", tip: "boolean" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // OYUN / KONSOL
  // ═══════════════════════════════════════════════════
  "Oyun/Konsol": {
    ad: "Oyun/Konsol",
    emoji: "🎮",
    altKategoriler: ["Konsol", "Oyun (Fiziksel)", "Oyun (Dijital Kod)", "Aksesuar", "PC Oyun Bileşeni", "Retro"],
    genelAlanlar: [
      { key: "platform", label: "Platform", tip: "select", zorunlu: true, secenekler: ["PlayStation 5", "PlayStation 4", "PlayStation 3", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "PC", "Retro"] },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal", "Hasarlı"] },
      { key: "dahilOyunlar", label: "Dahil Oyunlar", tip: "textarea", placeholder: "Ürünle birlikte gelen oyunları listeleyin" },
      { key: "kontrolcuSayisi", label: "Kontrolcü Sayısı", tip: "select", secenekler: ["0", "1", "2", "3", "4+"] },
      { key: "garantiDurumu", label: "Garanti", tip: "select", secenekler: ["Garantili", "Garantisiz", "Servis Garantisi"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // ANTİKA ESERLER
  // ═══════════════════════════════════════════════════
  "Antika Eserler": {
    ad: "Antika Eserler",
    emoji: "🏺",
    altKategoriler: ["Saat", "Tablo / Resim", "Heykel", "Çini / Seramik", "Para / Madalya", "Halı / Kilim", "Kitap / Belge", "Takı / Mücevher", "Diğer Antika"],
    genelAlanlar: [
      { key: "donem", label: "Dönem / Yüzyıl", tip: "text", zorunlu: true, placeholder: "Örn: 19. Yüzyıl, Osmanlı Dönemi" },
      { key: "malzeme", label: "Malzeme", tip: "text", placeholder: "Örn: Bakır, Porselen, Yağlıboya" },
      { key: "boyutlar", label: "Boyutlar", tip: "text", placeholder: "Örn: 30x40 cm" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Mükemmel", "Çok İyi", "İyi", "Restorasyon Gerekli"] },
      { key: "sertifika", label: "Sertifika / Belge", tip: "select", secenekler: ["Var", "Yok", "Kültür Bakanlığı Belgeli"] },
      { key: "koken", label: "Köken / Provenance", tip: "textarea", placeholder: "Eserin nereden geldiği, tarihçesi..." },
      { key: "uzmanGorüsü", label: "Uzman Görüşü", tip: "boolean" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KİTAP
  // ═══════════════════════════════════════════════════
  "Kitap": {
    ad: "Kitap",
    emoji: "📚",
    altKategoriler: ["Roman", "Kişisel Gelişim", "Akademik / Ders Kitabı", "Çocuk Kitabı", "Tarih", "Bilim", "Sanat", "Dergi / Gazete"],
    genelAlanlar: [
      { key: "yazar", label: "Yazar", tip: "text", zorunlu: true, placeholder: "Yazar adı" },
      { key: "yayinevi", label: "Yayınevi", tip: "text", placeholder: "Yayınevi adı" },
      { key: "baski", label: "Baskı", tip: "text", placeholder: "Örn: 5. Baskı, 2023" },
      { key: "dil", label: "Dil", tip: "select", secenekler: ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Arapça", "Diğer"] },
      { key: "durum", label: "Kitabın Durumu", tip: "select", zorunlu: true, secenekler: ["Sıfır (Hiç Açılmamış)", "Çok İyi", "İyi (Az Kalemli)", "Normal (Kullanılmış)"] },
      { key: "isbn", label: "ISBN", tip: "text", placeholder: "ISBN numarası (isteğe bağlı)" },
      { key: "adet", label: "Adet", tip: "number", placeholder: "1", min: 1 },
    ],
  },

  // ═══════════════════════════════════════════════════
  // TEKSTİL
  // ═══════════════════════════════════════════════════
  "Tekstil": {
    ad: "Tekstil",
    emoji: "👕",
    altKategoriler: ["Erkek Giyim", "Kadın Giyim", "Çocuk Giyim", "Ayakkabı", "Çanta", "Saat / Aksesuar", "Spor Giyim"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Nike, Zara, Mavi" },
      { key: "beden", label: "Beden / Numara", tip: "text", zorunlu: true, placeholder: "Örn: M, L, 42, 38" },
      { key: "renk", label: "Renk", tip: "text", placeholder: "Örn: Siyah, Beyaz, Lacivert" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Etiketli)", "Sıfır Gibi (1-2 Kez Giyildi)", "İkinci El - İyi", "İkinci El - Normal"] },
      { key: "malzeme", label: "Malzeme / Kumaş", tip: "text", placeholder: "Örn: %100 Pamuk, Deri, Polyester" },
      { key: "sezon", label: "Sezon", tip: "select", secenekler: ["İlkbahar/Yaz", "Sonbahar/Kış", "Tüm Sezon"] },
      { key: "orijinal", label: "Orijinallik", tip: "select", secenekler: ["Orijinal", "Replika", "Belirsiz"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KOZMETİK
  // ═══════════════════════════════════════════════════
  "Kozmetik": {
    ad: "Kozmetik",
    emoji: "💄",
    altKategoriler: ["Parfüm", "Makyaj", "Cilt Bakım", "Saç Bakım", "Erkek Bakım", "Set / Hediye Paketi"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Chanel, L'Oreal, MAC" },
      { key: "urunAdi", label: "Ürün Adı", tip: "text", zorunlu: true, placeholder: "Tam ürün adı" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır Gibi (%95+)", "Kullanılmış (%70-94)", "Kullanılmış (%50-69)"] },
      { key: "miktar", label: "Miktar / Hacim", tip: "text", placeholder: "Örn: 50ml, 30g" },
      { key: "sklt", label: "SKT (Son Kullanma)", tip: "text", placeholder: "Ay/Yıl" },
      { key: "orijinal", label: "Orijinallik", tip: "select", secenekler: ["Orjinal / Sıfır", "Orijinal / Kullanılmış", "Replika"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // PETSHOP
  // ═══════════════════════════════════════════════════
  "Petshop": {
    ad: "Petshop",
    emoji: "🐾",
    altKategoriler: ["Köpek", "Kedi", "Kuş", "Balık / Akvaryum", "Küçük Hayvanlar", "Sürüngenler", "Hayvan Malzemeleri"],
    genelAlanlar: [
      { key: "ilanTipi", label: "İlan Tipi", tip: "select", zorunlu: true, secenekler: ["Hayvan Satışı", "Hayvan Malzemesi", "Evlat Edinme (Ücretsiz)", "Kayıp İlan"] },
      { key: "tur", label: "Irk / Tür", tip: "text", zorunlu: true, placeholder: "Örn: Golden Retriever, British Shorthair" },
      { key: "yas", label: "Yaş", tip: "text", placeholder: "Örn: 2 Aylık, 1 Yaşında" },
      { key: "cinsiyet", label: "Cinsiyet", tip: "select", secenekler: ["Erkek", "Dişi", "Bilinmiyor"] },
      { key: "asıKart", label: "Aşı / Kısırlaştırma", tip: "multiselect", secenekler: ["Aşıları Tam", "Kısırlaştırılmış", "Mikroçipli", "Pet Pasaportu Var"] },
      { key: "belgeli", label: "Belge / Soy Ağacı", tip: "select", secenekler: ["Belgesiz", "Belge Var (Irk Belgesi)", "Soy Ağacı Var"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // MAKİNE
  // ═══════════════════════════════════════════════════
  "Makine": {
    ad: "Makine",
    emoji: "⚙️",
    altKategoriler: ["Tarım Makinesi", "İnşaat Makinesi", "Endüstriyel Makine", "Matbaa Makinesi", "Tekstil Makinesi", "Mutfak Endüstriyel"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Marka adı" },
      { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Model" },
      { key: "yil", label: "Üretim Yılı", tip: "year", placeholder: "2018" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Kullanılmış - Çalışır", "Revizyon Gerekli", "Parça Amaçlı"] },
      { key: "guc", label: "Güç / Kapasite", tip: "text", placeholder: "Örn: 50 HP, 500 kg/saat" },
      { key: "elektrik", label: "Elektrik", tip: "select", secenekler: ["220V", "380V", "Dizel", "Benzin", "Elektriksiz"] },
      { key: "nakliye", label: "Nakliye Bilgisi", tip: "textarea", placeholder: "Teslim koşulları, demontaj..." },
    ],
  },

  // ═══════════════════════════════════════════════════
  // EL SANATLARI
  // ═══════════════════════════════════════════════════
  "El Sanatları": {
    ad: "El Sanatları",
    emoji: "🎨",
    altKategoriler: ["Tablo / Resim", "Heykel", "Seramik / Çini", "Tekstil / Nakış", "Ahşap El Sanatı", "Takı Tasarım", "Özgün Tasarım"],
    genelAlanlar: [
      { key: "teknik", label: "Teknik", tip: "text", zorunlu: true, placeholder: "Örn: Yağlıboya, Suluboya, Ebru" },
      { key: "malzeme", label: "Malzeme", tip: "text", placeholder: "Kullanılan malzemeler" },
      { key: "boyutlar", label: "Boyutlar", tip: "text", placeholder: "Örn: 40x60 cm" },
      { key: "orijinal", label: "Tür", tip: "select", secenekler: ["Orijinal / Tek Parça", "Seri Üretim", "Baskı / Reprodüksiyon"] },
      { key: "cerceveli", label: "Çerçeveli", tip: "boolean" },
      { key: "imzali", label: "İmzalı", tip: "boolean" },
      { key: "sertifika", label: "Sertifika", tip: "boolean" },
      { key: "adet", label: "Stok Adedi", tip: "number", placeholder: "1", min: 1 },
    ],
  },

  // ═══════════════════════════════════════════════════
  // DOĞAL ÜRÜNLER
  // ═══════════════════════════════════════════════════
  "Doğal Ürünler": {
    ad: "Doğal Ürünler",
    emoji: "🌿",
    altKategoriler: ["Bal & Arı Ürünleri", "Zeytinyağı", "Peynir & Süt Ürünleri", "Kuruyemiş & Baharat", "Organik Sebze & Meyve", "Bitkisel Ürünler"],
    genelAlanlar: [
      { key: "uretimYeri", label: "Üretim Yeri", tip: "text", zorunlu: true, placeholder: "Örn: Ege, Karadeniz, Çanakkale" },
      { key: "uretimYili", label: "Hasat / Üretim Yılı", tip: "select", secenekler: ["2024", "2023", "2022", "2021"] },
      { key: "miktar", label: "Miktar / Ağırlık", tip: "text", zorunlu: true, placeholder: "Örn: 1 kg, 5 litre, 500g" },
      { key: "organikMi", label: "Organik Sertifikalı", tip: "boolean" },
      { key: "katki", label: "Katkı Maddesi", tip: "select", secenekler: ["Katkısız / Doğal", "Katkı Maddeli"] },
      { key: "ambalaj", label: "Ambalaj", tip: "select", secenekler: ["Cam Kavanoz", "Pet Şişe", "Vakumlu", "Dökme", "Özel Ambalaj"] },
      { key: "kargoya", label: "Kargoya Uygun", tip: "boolean" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // OYUNCAK
  // ═══════════════════════════════════════════════════
  "Oyuncak": {
    ad: "Oyuncak",
    emoji: "🧸",
    altKategoriler: ["Bebek Oyuncağı", "Yapboz / Kutu Oyun", "Lego / Yapı Seti", "Figür / Koleksiyon", "Dış Mekan", "Eğitici Oyuncak"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", placeholder: "Örn: Lego, Fisher-Price, Barbie" },
      { key: "yasGrubu", label: "Yaş Grubu", tip: "select", zorunlu: true, secenekler: ["0-1 Yaş", "1-3 Yaş", "3-5 Yaş", "5-8 Yaş", "8-12 Yaş", "12+ Yaş", "Yetişkin / Koleksiyon"] },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Kutusunda)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal", "Eksik Parçalı"] },
      { key: "kutusu", label: "Kutusu Var mı", tip: "boolean" },
      { key: "pil", label: "Pil Gerektirir", tip: "boolean" },
      { key: "parcaEksik", label: "Eksik Parça Var mı", tip: "boolean" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // KIRTASİYE
  // ═══════════════════════════════════════════════════
  "Kırtasiye": {
    ad: "Kırtasiye",
    emoji: "📎",
    altKategoriler: ["Okul Malzemesi", "Ofis Malzemesi", "Sanat Malzemesi", "Yazıcı & Toner", "Defter & Ajanda"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", placeholder: "Marka adı" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Kullanılmış", "Açık Paket"] },
      { key: "adet", label: "Adet / Miktar", tip: "text", zorunlu: true, placeholder: "Örn: 10 adet, 1 kutu" },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 2. EL (GENEL)
  // ═══════════════════════════════════════════════════
  "2. El": {
    ad: "2. El",
    emoji: "♻️",
    altKategoriler: ["Ev Eşyası", "Spor Ekipmanı", "Müzik Aletleri", "Bahçe & Dış Mekan", "Bebek & Çocuk", "Diğer"],
    genelAlanlar: [
      { key: "marka", label: "Marka (varsa)", tip: "text", placeholder: "Marka adı" },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır Gibi", "İyi", "Normal", "Kötü / Hasarlı"] },
      { key: "neden", label: "Satış Nedeni", tip: "select", secenekler: ["İhtiyaç fazlası", "Taşınma", "Yenisiyle değiştirme", "Hediye gelmişti", "Diğer"] },
      { key: "nakliye", label: "Nakliye", tip: "select", secenekler: ["Alıcı teslim alır", "Kargoya verilebilir", "Nakliye dahil"] },
    ],
  },

  // ═══════════════════════════════════════════════════
  // SIFIR ÜRÜNLER
  // ═══════════════════════════════════════════════════
  "Sıfır Ürünler": {
    ad: "Sıfır Ürünler",
    emoji: "✨",
    altKategoriler: ["Sıfır Elektronik", "Sıfır Giyim", "Sıfır Ev Eşyası", "Sıfır Kozmetik", "Sıfır Oyuncak", "Diğer Sıfır"],
    genelAlanlar: [
      { key: "marka", label: "Marka", tip: "text", zorunlu: true },
      { key: "model", label: "Model / Ürün Adı", tip: "text", zorunlu: true },
      { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır (Açılmış ama Kullanılmamış)"] },
      { key: "fatura", label: "Fatura Durumu", tip: "select", secenekler: ["Faturalı", "Faturasız"] },
      { key: "garanti", label: "Garanti", tip: "select", secenekler: ["Garantili", "Garantisiz"] },
      { key: "adet", label: "Stok Adedi", tip: "number", placeholder: "1", min: 1 },
      { key: "neden", label: "Satış Nedeni", tip: "select", secenekler: ["Hediye geldi", "İhtiyaç duymadım", "Yanlış sipariş", "Toplu alımdan artan", "Diğer"] },
    ],
  },
};

// Sektör listesi (sidebar için)
export const SEKTOR_LISTESI = Object.keys(SEKTOR_FORMLARI).map(key => ({
  key,
  ad: SEKTOR_FORMLARI[key].ad,
  emoji: SEKTOR_FORMLARI[key].emoji,
  altKategoriSayisi: SEKTOR_FORMLARI[key].altKategoriler.length,
}));
