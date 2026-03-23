"use client";
import React, { useState, useRef } from "react";
import { UploadCloud, X, CheckCircle, Loader2, MapPin, Zap, ChevronDown, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── RENKLER ────────────────────────────────────────────────────────────────
const navy     = "var(--navy, #0f2540)";
const gold     = "var(--gold, #c9a84c)";
const cream    = "var(--cream, #faf8f4)";
const white    = "#ffffff";
const border   = "var(--border, #dce6f0)";
const textSoft = "var(--text-soft, #8097b1)";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px",
  background: "#f5f7fa", border: `1.5px solid ${border}`,
  borderRadius: 12, fontFamily: "inherit", fontSize: 14,
  color: navy, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
  letterSpacing: "0.06em", color: textSoft, display: "block", marginBottom: 7,
};
const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 800, color: navy,
  textTransform: "uppercase" as const, letterSpacing: "0.05em",
  marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
};

// ─── ŞEHİRLER ───────────────────────────────────────────────────────────────
const sehirler = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın",
  "Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale",
  "Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir",
  "Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş",
  "Karabük","Karaman","Kars","Kastamonu","Kayseri","Kırıkkale","Kırklareli","Kırşehir","Kilis","Kocaeli",
  "Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye",
  "Rize","Sakarya","Samsun","Siirt","Sinop","Sivas","Şanlıurfa","Şırnak","Tekirdağ","Tokat","Trabzon",
  "Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

// ─── KATEGORİ YAPISI ─────────────────────────────────────────────────────────
const KATEGORILER = [
  { grup: "💻 ELEKTRONİK", emoji: "💻", secenekler: [
    "Elektronik - Telefon", "Elektronik - Bilgisayar", "Elektronik - Tablet",
    "Elektronik - TV & Monitör", "Elektronik - Ses Sistemi",
    "Elektronik - Kamera", "Elektronik - Oyun Konsolu", "Elektronik - Beyaz Eşya", "Elektronik - Diğer",
  ]},
  { grup: "🚗 ARAÇ & VASITA", emoji: "🚗", secenekler: [
    "Araç - Otomobil", "Araç - Motosiklet", "Araç - SUV & Crossover",
    "Araç - Ticari Araç", "Araç - Karavan", "Araç - Bisiklet & Scooter", "Araç - Yedek Parça",
  ]},
  { grup: "🏠 EMLAK", emoji: "🏠", secenekler: [
    "Emlak - Satılık Konut", "Emlak - Kiralık Konut", "Emlak - Satılık İşyeri",
    "Emlak - Kiralık İşyeri", "Emlak - Arsa & Tarla", "Emlak - Villa", "Emlak - Devremülk",
  ]},
  { grup: "🪑 MOBİLYA & EV", emoji: "🪑", secenekler: [
    "Mobilya - Oturma Odası", "Mobilya - Yatak Odası", "Mobilya - Yemek Odası",
    "Mobilya - Mutfak", "Mobilya - Banyo", "Mobilya - Ofis Mobilyası", "Mobilya - Çocuk Odası",
  ]},
  { grup: "🎮 OYUN & KONSOL", emoji: "🎮", secenekler: [
    "Oyun - Konsol", "Oyun - Oyun (Fiziksel)", "Oyun - Dijital Kod", "Oyun - Aksesuar", "Oyun - Retro",
  ]},
  { grup: "🏺 ANTİKA & SANAT", emoji: "🏺", secenekler: [
    "Antika - Saat", "Antika - Tablo & Resim", "Antika - Heykel",
    "Antika - Para & Madalya", "Antika - Halı & Kilim", "Antika - Kitap & Belge", "Antika - Diğer",
  ]},
  { grup: "👕 TEKSTİL & MODA", emoji: "👕", secenekler: [
    "Tekstil - Erkek Giyim", "Tekstil - Kadın Giyim", "Tekstil - Çocuk Giyim",
    "Tekstil - Ayakkabı", "Tekstil - Çanta", "Tekstil - Saat & Aksesuar",
  ]},
  { grup: "📚 KİTAP & KIRTASİYE", emoji: "📚", secenekler: [
    "Kitap - Roman", "Kitap - Kişisel Gelişim", "Kitap - Akademik",
    "Kitap - Çocuk", "Kitap - Dergi", "Kırtasiye - Okul", "Kırtasiye - Sanat Malzemesi",
  ]},
  { grup: "💄 KOZMETİK", emoji: "💄", secenekler: [
    "Kozmetik - Parfüm", "Kozmetik - Makyaj", "Kozmetik - Cilt Bakım",
    "Kozmetik - Saç Bakım", "Kozmetik - Set & Hediye",
  ]},
  { grup: "🐾 PETSHOP", emoji: "🐾", secenekler: [
    "Petshop - Köpek", "Petshop - Kedi", "Petshop - Kuş",
    "Petshop - Akvaryum", "Petshop - Hayvan Malzemeleri",
  ]},
  { grup: "⚙️ MAKİNE & SANAYİ", emoji: "⚙️", secenekler: [
    "Makine - Tarım", "Makine - İnşaat", "Makine - Endüstriyel",
    "Makine - Tekstil Makinesi", "Makine - Diğer",
  ]},
  { grup: "🎨 EL SANATLARI", emoji: "🎨", secenekler: [
    "El Sanatı - Tablo", "El Sanatı - Seramik", "El Sanatı - Tekstil & Nakış",
    "El Sanatı - Ahşap", "El Sanatı - Takı Tasarım",
  ]},
  { grup: "🌿 DOĞAL ÜRÜNLER", emoji: "🌿", secenekler: [
    "Doğal - Bal & Arı Ürünleri", "Doğal - Zeytinyağı", "Doğal - Peynir & Süt",
    "Doğal - Kuruyemiş & Baharat", "Doğal - Organik Sebze & Meyve",
  ]},
  { grup: "🧸 OYUNCAK", emoji: "🧸", secenekler: [
    "Oyuncak - Bebek", "Oyuncak - Lego & Yapı Seti", "Oyuncak - Figür & Koleksiyon",
    "Oyuncak - Kutu Oyun", "Oyuncak - Eğitici",
  ]},
  { grup: "♻️ 2. EL & DİĞER", emoji: "♻️", secenekler: [
    "2. El - Spor Ekipmanı", "2. El - Müzik Aleti", "2. El - Bahçe & Dış Mekan",
    "2. El - Bebek & Çocuk", "Diğer",
  ]},
];

// ─── SEKTÖRE ÖZEL ALAN TANIMLARI ─────────────────────────────────────────────
type AlanTip = "text" | "number" | "select" | "multiselect" | "boolean" | "textarea" | "year" | "km";

interface OzelAlan {
  key: string;
  label: string;
  tip: AlanTip;
  zorunlu?: boolean;
  placeholder?: string;
  secenekler?: string[];
  suffix?: string;
}

const YILLAR = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

const SEKTOR_ALANLARI: Record<string, OzelAlan[]> = {
  // ── ELEKTRONİK ──────────────────────────────────
  "Elektronik - Telefon": [
    { key: "marka", label: "Marka", tip: "select", zorunlu: true, secenekler: ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "OnePlus", "Nokia", "Motorola", "Diğer"] },
    { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: iPhone 15 Pro, Galaxy S24" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Açılmamış)", "Sıfır Gibi", "İkinci El - Çok İyi", "İkinci El - İyi", "İkinci El - Normal", "Hasarlı / Arızalı"] },
    { key: "depolama", label: "Depolama", tip: "select", secenekler: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] },
    { key: "ram", label: "RAM", tip: "select", secenekler: ["2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB"] },
    { key: "renk", label: "Renk", tip: "text", placeholder: "Örn: Siyah, Uzay Grisi" },
    { key: "garantiDurumu", label: "Garanti", tip: "select", secenekler: ["Garantisi Var", "Garantisi Yok", "Servis Garantisi"] },
    { key: "faturaDurumu", label: "Fatura", tip: "select", secenekler: ["Faturalı", "Faturasız"] },
    { key: "aksesuar", label: "Aksesuarlar", tip: "multiselect", secenekler: ["Orijinal Kutu", "Şarj Aleti", "Kulaklık", "Kılıf", "Ekran Koruyucu"] },
  ],
  "Elektronik - Bilgisayar": [
    { key: "marka", label: "Marka", tip: "select", zorunlu: true, secenekler: ["Apple", "Asus", "Lenovo", "HP", "Dell", "Acer", "MSI", "Toshiba", "Diğer"] },
    { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: MacBook Pro M3, Asus ROG" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal", "Arızalı"] },
    { key: "islemci", label: "İşlemci", tip: "text", placeholder: "Örn: Intel i7-12700H, AMD Ryzen 7" },
    { key: "ram", label: "RAM", tip: "select", secenekler: ["4 GB", "8 GB", "16 GB", "32 GB", "64 GB"] },
    { key: "depolama", label: "Depolama", tip: "select", secenekler: ["128 GB SSD", "256 GB SSD", "512 GB SSD", "1 TB SSD", "1 TB HDD", "2 TB HDD"] },
    { key: "ekranKarti", label: "Ekran Kartı", tip: "text", placeholder: "Örn: RTX 3060, Entegre" },
    { key: "ekranBoyutu", label: "Ekran", tip: "text", placeholder: "Örn: 15.6 inç", suffix: "inç" },
    { key: "isletimSistemi", label: "İşletim Sistemi", tip: "select", secenekler: ["Windows 11", "Windows 10", "macOS", "Linux", "Yok"] },
    { key: "garantiDurumu", label: "Garanti", tip: "select", secenekler: ["Garantili", "Garantisiz"] },
  ],
  "Elektronik - Tablet": [
    { key: "marka", label: "Marka", tip: "select", zorunlu: true, secenekler: ["Apple iPad", "Samsung", "Xiaomi", "Huawei", "Lenovo", "Diğer"] },
    { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: iPad Pro 12.9, Galaxy Tab S9" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "depolama", label: "Depolama", tip: "select", secenekler: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB"] },
    { key: "ekranBoyutu", label: "Ekran", tip: "text", placeholder: "Örn: 10.9 inç" },
    { key: "baglantilik", label: "Bağlantı", tip: "select", secenekler: ["Yalnızca Wi-Fi", "Wi-Fi + Cellular"] },
    { key: "aksesuar", label: "Aksesuarlar", tip: "multiselect", secenekler: ["Kalem", "Klavye", "Kutu", "Şarj Aleti", "Kılıf"] },
  ],
  "Elektronik - TV & Monitör": [
    { key: "marka", label: "Marka", tip: "select", zorunlu: true, secenekler: ["Samsung", "LG", "Sony", "Philips", "Vestel", "Arçelik", "Diğer"] },
    { key: "ekranBoyutu", label: "Ekran Boyutu", tip: "number", zorunlu: true, placeholder: "55", suffix: "inç" },
    { key: "cozunurluk", label: "Çözünürlük", tip: "select", secenekler: ["HD 720p", "Full HD 1080p", "4K 2160p", "8K"] },
    { key: "panel", label: "Panel Tipi", tip: "select", secenekler: ["LED", "OLED", "QLED", "IPS", "VA"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "akillitv", label: "Akıllı TV", tip: "boolean" },
  ],
  "Elektronik - Oyun Konsolu": [
    { key: "platform", label: "Platform", tip: "select", zorunlu: true, secenekler: ["PlayStation 5", "PlayStation 4", "PlayStation 3", "Xbox Series X/S", "Xbox One", "Nintendo Switch", "Retro"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "dahilOyunlar", label: "Dahil Oyunlar", tip: "textarea", placeholder: "Ürünle birlikte gelen oyunları yazın" },
    { key: "kontrolcuSayisi", label: "Kontrolcü Sayısı", tip: "select", secenekler: ["0", "1", "2", "3", "4+"] },
    { key: "garantiDurumu", label: "Garanti", tip: "select", secenekler: ["Garantili", "Garantisiz"] },
  ],
  // ── ARAÇ ────────────────────────────────────────
  "Araç - Otomobil": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Toyota, BMW, Ford" },
    { key: "model", label: "Model", tip: "text", zorunlu: true, placeholder: "Örn: Corolla, 3 Serisi, Focus" },
    { key: "yil", label: "Model Yılı", tip: "year", zorunlu: true },
    { key: "km", label: "Kilometre", tip: "km", zorunlu: true, placeholder: "45000", suffix: "km" },
    { key: "yakit", label: "Yakıt", tip: "select", zorunlu: true, secenekler: ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik", "Benzin + LPG"] },
    { key: "vites", label: "Vites", tip: "select", zorunlu: true, secenekler: ["Manuel", "Otomatik", "Yarı Otomatik", "CVT"] },
    { key: "kasa", label: "Kasa Tipi", tip: "select", secenekler: ["Sedan", "Hatchback", "Station Wagon", "SUV", "Coupe", "Cabrio", "Pickup"] },
    { key: "renk", label: "Renk", tip: "text", placeholder: "Örn: Beyaz, Siyah" },
    { key: "motorHacmi", label: "Motor Hacmi", tip: "text", placeholder: "Örn: 1.6", suffix: "cc" },
    { key: "motorGucu", label: "Motor Gücü", tip: "number", placeholder: "120", suffix: "HP" },
    { key: "cekis", label: "Çekiş", tip: "select", secenekler: ["Önden Çekiş", "Arkadan İtiş", "4x4", "AWD"] },
    { key: "agirHasar", label: "Ağır Hasar / Tramer", tip: "select", zorunlu: true, secenekler: ["Yok", "Var"] },
    { key: "boyaBilgi", label: "Boya / Değişen Parçalar", tip: "textarea", placeholder: "Örn: Tüm orijinal, sol arka kapı boyalı..." },
    { key: "ekspertiz", label: "Ekspertiz", tip: "select", secenekler: ["Ekspertiz Yapılabilir", "Ekspertiz Yapıldı - Temiz", "Ekspertiz Yok"] },
    { key: "krediyeUygun", label: "Krediye Uygun", tip: "boolean" },
  ],
  "Araç - Motosiklet": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Honda, Yamaha, BMW" },
    { key: "model", label: "Model", tip: "text", zorunlu: true },
    { key: "yil", label: "Model Yılı", tip: "year", zorunlu: true },
    { key: "km", label: "Kilometre", tip: "km", zorunlu: true, suffix: "km" },
    { key: "motorTipi", label: "Motosiklet Tipi", tip: "select", secenekler: ["Naked", "Sport", "Enduro", "Scooter", "Chopper", "Touring", "Cross"] },
    { key: "motorHacmi", label: "Motor Hacmi", tip: "number", placeholder: "650", suffix: "cc" },
    { key: "renk", label: "Renk", tip: "text" },
    { key: "ehliyet", label: "Ehliyet Sınıfı", tip: "select", secenekler: ["A1", "A2", "A"] },
  ],
  // ── EMLAK ────────────────────────────────────────
  "Emlak - Satılık Konut": [
    { key: "emlakTipi", label: "Konut Tipi", tip: "select", zorunlu: true, secenekler: ["Daire", "Villa", "Müstakil Ev", "Bina", "Yazlık"] },
    { key: "metrekare", label: "Alan (m²)", tip: "number", zorunlu: true, placeholder: "120", suffix: "m²" },
    { key: "odaSayisi", label: "Oda Sayısı", tip: "select", zorunlu: true, secenekler: ["Stüdyo", "1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1 ve üzeri"] },
    { key: "kat", label: "Bulunduğu Kat", tip: "select", secenekler: ["Bodrum", "Zemin", "Bahçe", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"] },
    { key: "binaKati", label: "Bina Kat Sayısı", tip: "number", placeholder: "5" },
    { key: "isitma", label: "Isıtma", tip: "select", secenekler: ["Merkezi", "Kombi", "Yerden Isıtma", "Klima", "Soba", "Yok"] },
    { key: "yapimYili", label: "Yapım Yılı", tip: "year" },
    { key: "tapu", label: "Tapu Durumu", tip: "select", secenekler: ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Payı", "Hisseli Tapu"] },
    { key: "aidat", label: "Aidat", tip: "number", placeholder: "500", suffix: "₺/ay" },
    { key: "ozellikler", label: "Özellikler", tip: "multiselect", secenekler: ["Asansör", "Otopark", "Güvenlik", "Balkon", "Teras", "Bahçe", "Havuz", "Spor Salonu", "Ebeveyn Banyosu", "Şömine"] },
    { key: "esyaDurumu", label: "Eşya Durumu", tip: "select", secenekler: ["Boş", "Beyaz Eşyalı", "Mobilyalı", "Tam Eşyalı"] },
  ],
  "Emlak - Kiralık Konut": [
    { key: "emlakTipi", label: "Konut Tipi", tip: "select", zorunlu: true, secenekler: ["Daire", "Villa", "Müstakil Ev", "Yazlık"] },
    { key: "metrekare", label: "Alan (m²)", tip: "number", zorunlu: true, suffix: "m²" },
    { key: "odaSayisi", label: "Oda Sayısı", tip: "select", zorunlu: true, secenekler: ["Stüdyo", "1+0", "1+1", "2+1", "3+1", "4+1", "5+1+"] },
    { key: "kat", label: "Bulunduğu Kat", tip: "select", secenekler: ["Bodrum", "Zemin", "1", "2", "3", "4", "5", "6", "7+"] },
    { key: "isitma", label: "Isıtma", tip: "select", secenekler: ["Merkezi", "Kombi", "Klima", "Soba", "Yok"] },
    { key: "aidat", label: "Aidat", tip: "number", placeholder: "500", suffix: "₺/ay" },
    { key: "depozito", label: "Depozito", tip: "number", placeholder: "5000", suffix: "₺" },
    { key: "ozellikler", label: "Özellikler", tip: "multiselect", secenekler: ["Asansör", "Otopark", "Güvenlik", "Balkon", "Bahçe", "Havuz"] },
    { key: "esyaDurumu", label: "Eşya Durumu", tip: "select", secenekler: ["Boş", "Beyaz Eşyalı", "Mobilyalı", "Tam Eşyalı"] },
  ],
  "Emlak - Arsa & Tarla": [
    { key: "metrekare", label: "Alan (m²)", tip: "number", zorunlu: true, suffix: "m²" },
    { key: "imar", label: "İmar Durumu", tip: "select", zorunlu: true, secenekler: ["İmarlı", "İmarsız", "Tarla", "Bağ & Bahçe", "Sanayi"] },
    { key: "tapu", label: "Tapu Türü", tip: "select", secenekler: ["Müstakil Tapu", "Hisseli Tapu", "Köy Tapusu"] },
    { key: "yol", label: "Yola Cephesi", tip: "boolean" },
    { key: "elektrikkSu", label: "Elektrik & Su", tip: "boolean" },
  ],
  // ── MOBİLYA ──────────────────────────────────────
  "Mobilya - Oturma Odası": [
    { key: "urunTipi", label: "Ürün Tipi", tip: "select", zorunlu: true, secenekler: ["Koltuk Takımı", "Kanepe", "TV Ünitesi", "Sehpa", "Vitrin", "Köşe Koltuk", "Berjer"] },
    { key: "marka", label: "Marka", tip: "text", placeholder: "Örn: İstikbal, Bellona, İkea" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "malzeme", label: "Malzeme", tip: "select", secenekler: ["Kumaş", "Deri", "Suni Deri", "Ahşap", "MDF", "Metal", "Cam"] },
    { key: "renk", label: "Renk", tip: "text" },
    { key: "boyutlar", label: "Boyutlar", tip: "text", placeholder: "Örn: 230x95x85cm" },
    { key: "demontaj", label: "Demontaj Yapılabilir", tip: "boolean" },
    { key: "nakliye", label: "Nakliye Dahil", tip: "boolean" },
  ],
  "Mobilya - Yatak Odası": [
    { key: "urunTipi", label: "Ürün Tipi", tip: "select", zorunlu: true, secenekler: ["Yatak Odası Takımı", "Yatak", "Gardırop", "Komodin", "Şifonyer", "Ayna"] },
    { key: "marka", label: "Marka", tip: "text" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "yatakBoyutu", label: "Yatak Boyutu", tip: "select", secenekler: ["Tek Kişilik (90x190)", "Büyük Tek (100x200)", "Çift Kişilik (150x200)", "King Size (180x200)"] },
    { key: "malzeme", label: "Malzeme", tip: "select", secenekler: ["Masif Ahşap", "MDF", "Sunta", "Metal"] },
    { key: "renk", label: "Renk", tip: "text" },
    { key: "demontaj", label: "Demontaj Yapılabilir", tip: "boolean" },
  ],
  // ── ANTİKA ────────────────────────────────────────
  "Antika - Tablo & Resim": [
    { key: "teknik", label: "Teknik", tip: "select", zorunlu: true, secenekler: ["Yağlıboya", "Suluboya", "Akrilik", "Pastel", "Gravür", "Baskı", "Dijital"] },
    { key: "donem", label: "Dönem / Yüzyıl", tip: "text", placeholder: "Örn: 19. Yüzyıl, Osmanlı Dönemi" },
    { key: "boyutlar", label: "Boyutlar", tip: "text", placeholder: "Örn: 40x60 cm" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Mükemmel", "Çok İyi", "İyi", "Restorasyon Gerekli"] },
    { key: "cerceveli", label: "Çerçeveli", tip: "boolean" },
    { key: "imzali", label: "İmzalı", tip: "boolean" },
    { key: "sertifika", label: "Sertifika Var", tip: "boolean" },
    { key: "orijinal", label: "Tür", tip: "select", secenekler: ["Orijinal / Tek Parça", "Baskı / Reprodüksiyon"] },
  ],
  "Antika - Saat": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Rolex, Omega, Antika duvar saati" },
    { key: "model", label: "Model", tip: "text" },
    { key: "donem", label: "Dönem / Yıl", tip: "text", placeholder: "Örn: 1950'ler, Osmanlı" },
    { key: "tip", label: "Saat Tipi", tip: "select", secenekler: ["Kol Saati", "Cep Saati", "Duvar Saati", "Masa Saati", "Köşe Saati"] },
    { key: "malzeme", label: "Kasa Malzemesi", tip: "select", secenekler: ["Altın", "Gümüş", "Paslanmaz Çelik", "Sarı Metal", "Ahşap", "Diğer"] },
    { key: "durum", label: "Çalışma Durumu", tip: "select", zorunlu: true, secenekler: ["Çalışıyor", "Çalışmıyor", "Bilinmiyor"] },
    { key: "kutusu", label: "Kutusu Var mı", tip: "boolean" },
    { key: "sertifika", label: "Sertifika / Belge", tip: "boolean" },
  ],
  // ── KİTAP ─────────────────────────────────────────
  "Kitap - Roman": [
    { key: "yazar", label: "Yazar", tip: "text", zorunlu: true },
    { key: "yayinevi", label: "Yayınevi", tip: "text" },
    { key: "baski", label: "Baskı", tip: "text", placeholder: "Örn: 5. Baskı, 2023" },
    { key: "dil", label: "Dil", tip: "select", secenekler: ["Türkçe", "İngilizce", "Almanca", "Fransızca", "Diğer"] },
    { key: "durum", label: "Kitabın Durumu", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Çok İyi", "İyi (Az Kalemli)", "Normal (Kullanılmış)"] },
    { key: "adet", label: "Adet", tip: "number", placeholder: "1" },
  ],
  "Kitap - Akademik": [
    { key: "yazar", label: "Yazar", tip: "text", zorunlu: true },
    { key: "konu", label: "Konu / Ders", tip: "text", placeholder: "Örn: Tıp, Hukuk, Mühendislik" },
    { key: "baski", label: "Baskı / Yıl", tip: "text" },
    { key: "dil", label: "Dil", tip: "select", secenekler: ["Türkçe", "İngilizce", "Diğer"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Çok İyi", "İyi", "Normal"] },
  ],
  // ── TEKSTİL ───────────────────────────────────────
  "Tekstil - Erkek Giyim": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Nike, Mavi, Zara Man" },
    { key: "beden", label: "Beden", tip: "select", zorunlu: true, secenekler: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"] },
    { key: "renk", label: "Renk", tip: "text" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Etiketli)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "malzeme", label: "Kumaş", tip: "text", placeholder: "Örn: %100 Pamuk, Denim" },
    { key: "sezon", label: "Sezon", tip: "select", secenekler: ["İlkbahar/Yaz", "Sonbahar/Kış", "Tüm Sezon"] },
  ],
  "Tekstil - Kadın Giyim": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true },
    { key: "beden", label: "Beden", tip: "select", zorunlu: true, secenekler: ["34", "36", "38", "40", "42", "44", "46", "48", "50+"] },
    { key: "renk", label: "Renk", tip: "text" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Etiketli)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "malzeme", label: "Kumaş", tip: "text" },
    { key: "sezon", label: "Sezon", tip: "select", secenekler: ["İlkbahar/Yaz", "Sonbahar/Kış", "Tüm Sezon"] },
  ],
  "Tekstil - Ayakkabı": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true },
    { key: "numara", label: "Numara", tip: "text", zorunlu: true, placeholder: "Örn: 42, 38" },
    { key: "cinsiyet", label: "Cinsiyet", tip: "select", secenekler: ["Erkek", "Kadın", "Unisex", "Çocuk"] },
    { key: "tip", label: "Tür", tip: "select", secenekler: ["Spor Ayakkabı", "Bot", "Topuklu", "Loafer", "Sandalet", "Terlik", "Klasik"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Kutusunda)", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal"] },
    { key: "orijinal", label: "Orijinallik", tip: "select", secenekler: ["Orijinal", "Replika"] },
  ],
  // ── KOZMETİK ──────────────────────────────────────
  "Kozmetik - Parfüm": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true, placeholder: "Örn: Chanel, Dior, YSL" },
    { key: "model", label: "Parfüm Adı", tip: "text", zorunlu: true },
    { key: "miktar", label: "Hacim", tip: "text", placeholder: "Örn: 100ml, 50ml", suffix: "ml" },
    { key: "cinsiyet", label: "Cinsiyet", tip: "select", secenekler: ["Erkek", "Kadın", "Unisex"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır Gibi (%95+)", "Kullanılmış (%70-94)", "Kullanılmış (%50-69)"] },
    { key: "orijinal", label: "Orijinallik", tip: "select", secenekler: ["Orijinal", "Tester", "Replika"] },
  ],
  "Kozmetik - Makyaj": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true },
    { key: "urunTipi", label: "Ürün Tipi", tip: "select", zorunlu: true, secenekler: ["Fondöten", "Ruj", "Far Paleti", "Maskara", "Allık", "Kaş", "Primer", "Set"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Mühürlü)", "Sıfır Gibi", "Kullanılmış"] },
    { key: "skt", label: "SKT (Son Kullanma)", tip: "text", placeholder: "Örn: 06/2026" },
  ],
  // ── PETSHOP ───────────────────────────────────────
  "Petshop - Köpek": [
    { key: "tur", label: "Irk", tip: "text", zorunlu: true, placeholder: "Örn: Golden Retriever, Labrador" },
    { key: "yas", label: "Yaş", tip: "text", placeholder: "Örn: 2 Aylık, 1 Yaşında" },
    { key: "cinsiyet", label: "Cinsiyet", tip: "select", secenekler: ["Erkek", "Dişi"] },
    { key: "asiDurumu", label: "Aşı & Sağlık", tip: "multiselect", secenekler: ["Aşıları Tam", "Kısırlaştırılmış", "Mikroçipli", "Pet Pasaportu"] },
    { key: "belgeli", label: "Irk Belgesi", tip: "select", secenekler: ["Belgesiz", "Irk Belgesi Var", "Soy Ağacı Var"] },
    { key: "ilanTipi", label: "İlan Tipi", tip: "select", zorunlu: true, secenekler: ["Satılık", "Evlat Edinme (Ücretsiz)"] },
  ],
  "Petshop - Kedi": [
    { key: "tur", label: "Irk", tip: "text", zorunlu: true, placeholder: "Örn: British Shorthair, Scottish Fold" },
    { key: "yas", label: "Yaş", tip: "text" },
    { key: "cinsiyet", label: "Cinsiyet", tip: "select", secenekler: ["Erkek", "Dişi"] },
    { key: "asiDurumu", label: "Aşı & Sağlık", tip: "multiselect", secenekler: ["Aşıları Tam", "Kısırlaştırılmış", "Mikroçipli"] },
    { key: "belgeli", label: "Irk Belgesi", tip: "select", secenekler: ["Belgesiz", "Irk Belgesi Var"] },
    { key: "ilanTipi", label: "İlan Tipi", tip: "select", zorunlu: true, secenekler: ["Satılık", "Evlat Edinme (Ücretsiz)"] },
  ],
  // ── MAKİNE ────────────────────────────────────────
  "Makine - Tarım": [
    { key: "marka", label: "Marka", tip: "text", zorunlu: true },
    { key: "model", label: "Model", tip: "text", zorunlu: true },
    { key: "yil", label: "Üretim Yılı", tip: "year" },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Kullanılmış - Çalışır", "Revizyon Gerekli", "Parça Amaçlı"] },
    { key: "guc", label: "Güç / Kapasite", tip: "text", placeholder: "Örn: 90 HP, 500 kg" },
    { key: "elektrik", label: "Güç Kaynağı", tip: "select", secenekler: ["Dizel", "Benzin", "Elektrik", "Kuyruk Mili"] },
    { key: "nakliye", label: "Nakliye Bilgisi", tip: "textarea", placeholder: "Teslim koşulları..." },
  ],
  // ── EL SANATLARI ──────────────────────────────────
  "El Sanatı - Tablo": [
    { key: "teknik", label: "Teknik", tip: "select", zorunlu: true, secenekler: ["Yağlıboya", "Suluboya", "Akrilik", "Pastel", "Ebru", "Hat", "Karakalem", "Dijital"] },
    { key: "boyutlar", label: "Boyutlar", tip: "text", placeholder: "Örn: 40x60 cm" },
    { key: "orijinal", label: "Tür", tip: "select", secenekler: ["Orijinal / Tek Parça", "Seri Üretim", "Baskı"] },
    { key: "cerceveli", label: "Çerçeveli", tip: "boolean" },
    { key: "imzali", label: "İmzalı", tip: "boolean" },
    { key: "adet", label: "Stok Adedi", tip: "number", placeholder: "1" },
  ],
  // ── DOĞAL ÜRÜNLER ─────────────────────────────────
  "Doğal - Bal & Arı Ürünleri": [
    { key: "tur", label: "Çeşit", tip: "select", zorunlu: true, secenekler: ["Çiçek Balı", "Orman Balı", "Kestane Balı", "Lavanta Balı", "Polen", "Propolis", "Arı Sütü", "Balmumu"] },
    { key: "uretimYeri", label: "Üretim Yeri", tip: "text", zorunlu: true, placeholder: "Örn: Karadeniz, Ege" },
    { key: "hasat", label: "Hasat Yılı", tip: "select", secenekler: ["2024", "2023", "2022"] },
    { key: "miktar", label: "Miktar", tip: "text", zorunlu: true, placeholder: "Örn: 1 kg, 500g" },
    { key: "organik", label: "Organik Sertifikalı", tip: "boolean" },
    { key: "ambalaj", label: "Ambalaj", tip: "select", secenekler: ["Cam Kavanoz", "Pet Şişe", "Dökme", "Özel Ambalaj"] },
    { key: "kargo", label: "Kargoya Uygun", tip: "boolean" },
  ],
  "Doğal - Zeytinyağı": [
    { key: "tur", label: "Tür", tip: "select", zorunlu: true, secenekler: ["Natürel Sızma", "Riviera", "Rafine", "Organik Sızma"] },
    { key: "uretimYeri", label: "Üretim Yeri", tip: "text", zorunlu: true, placeholder: "Örn: Ayvalık, Edremit" },
    { key: "miktar", label: "Miktar", tip: "text", zorunlu: true, placeholder: "Örn: 5 litre, 1 teneke" },
    { key: "hasat", label: "Hasat Yılı", tip: "select", secenekler: ["2024", "2023"] },
    { key: "asitlik", label: "Asitlik Oranı", tip: "text", placeholder: "Örn: %0.3" },
    { key: "organik", label: "Organik Sertifikalı", tip: "boolean" },
  ],
  // ── OYUNCAK ────────────────────────────────────────
  "Oyuncak - Lego & Yapı Seti": [
    { key: "marka", label: "Marka", tip: "select", zorunlu: true, secenekler: ["Lego", "Mega Bloks", "Cobi", "Diğer"] },
    { key: "set", label: "Set Adı / Numarası", tip: "text", placeholder: "Örn: Lego 42143, City 60234" },
    { key: "yasGrubu", label: "Yaş Grubu", tip: "select", secenekler: ["3-5 Yaş", "5-8 Yaş", "8-12 Yaş", "12+ Yaş", "Yetişkin"] },
    { key: "durum", label: "Durum", tip: "select", zorunlu: true, secenekler: ["Sıfır (Kutusunda)", "Sıfır Gibi", "İkinci El - Eksiksiz", "Eksik Parçalı"] },
    { key: "kutu", label: "Kutusunda mı", tip: "boolean" },
    { key: "talimat", label: "Talimat Kitabı Var mı", tip: "boolean" },
  ],
};

// Belirli bir kategori için varsayılan alanlar (eşleşme yoksa)
const VARSAYILAN_ALANLAR: OzelAlan[] = [
  { key: "marka", label: "Marka / Model", tip: "text", placeholder: "Marka veya model adı" },
  { key: "durum", label: "Ürün Durumu", tip: "select", zorunlu: true, secenekler: ["Sıfır", "Sıfır Gibi", "İkinci El - İyi", "İkinci El - Normal", "Hasarlı"] },
  { key: "renk", label: "Renk", tip: "text", placeholder: "Renk bilgisi" },
];

// ─── CLOUDINARY ───────────────────────────────────────────────────────────────
const CLOUD_NAME    = "diuamcnej";
const UPLOAD_PRESET = "atakasa_hizli";

// ─── YARDIMCI: alan input'u render et ─────────────────────────────────────────
function renderOzelAlan(
  alan: OzelAlan,
  deger: any,
  onChange: (key: string, val: any) => void,
) {
  const base: React.CSSProperties = { ...inputStyle };

  if (alan.tip === "select") {
    return (
      <select
        value={deger || ""}
        onChange={e => onChange(alan.key, e.target.value)}
        style={{ ...base, appearance: "none" as any, cursor: "pointer" }}
        onFocus={e => (e.target.style.borderColor = navy)}
        onBlur={e => (e.target.style.borderColor = border)}
      >
        <option value="">Seçiniz...</option>
        {alan.secenekler?.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    );
  }

  if (alan.tip === "multiselect") {
    const secili: string[] = Array.isArray(deger) ? deger : [];
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {alan.secenekler?.map(s => {
          const secildi = secili.includes(s);
          return (
            <button key={s} type="button"
              onClick={() => {
                const yeni = secildi ? secili.filter(x => x !== s) : [...secili, s];
                onChange(alan.key, yeni);
              }}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: secildi ? `2px solid ${navy}` : `2px solid ${border}`,
                background: secildi ? navy : white, color: secildi ? white : textSoft,
                fontFamily: "inherit", transition: "all 0.15s",
              }}
            >
              {secildi ? "✓ " : ""}{s}
            </button>
          );
        })}
      </div>
    );
  }

  if (alan.tip === "boolean") {
    const aktif = !!deger;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button"
          onClick={() => onChange(alan.key, !aktif)}
          style={{
            width: 48, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
            background: aktif ? navy : "#e5e7eb", position: "relative", transition: "background 0.2s", flexShrink: 0,
          }}
        >
          <span style={{
            position: "absolute", top: 3, left: aktif ? 25 : 3,
            width: 20, height: 20, borderRadius: "50%", background: white,
            transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }} />
        </button>
        <span style={{ fontSize: 13, color: aktif ? navy : textSoft, fontWeight: 600 }}>
          {aktif ? "Evet" : "Hayır"}
        </span>
      </div>
    );
  }

  if (alan.tip === "textarea") {
    return (
      <textarea value={deger || ""}
        onChange={e => onChange(alan.key, e.target.value)}
        placeholder={alan.placeholder} rows={3}
        style={{ ...base, resize: "vertical" as any, lineHeight: 1.6 }}
        onFocus={e => (e.target.style.borderColor = navy)}
        onBlur={e => (e.target.style.borderColor = border)}
      />
    );
  }

  if (alan.tip === "year") {
    return (
      <select value={deger || ""}
        onChange={e => onChange(alan.key, e.target.value)}
        style={{ ...base, appearance: "none" as any, cursor: "pointer" }}
        onFocus={e => (e.target.style.borderColor = navy)}
        onBlur={e => (e.target.style.borderColor = border)}
      >
        <option value="">Yıl seçin</option>
        {YILLAR.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
    );
  }

  // text, number, km
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
      <input
        type={alan.tip === "number" || alan.tip === "km" ? "number" : "text"}
        value={deger || ""}
        onChange={e => onChange(alan.key, e.target.value)}
        placeholder={alan.placeholder}
        min={0}
        style={{ ...base, paddingRight: alan.suffix ? 48 : 14 }}
        onFocus={e => (e.target.style.borderColor = navy)}
        onBlur={e => (e.target.style.borderColor = border)}
      />
      {alan.suffix && (
        <span style={{ position: "absolute", right: 14, fontSize: 12, color: textSoft, fontWeight: 600, pointerEvents: "none" }}>
          {alan.suffix}
        </span>
      )}
    </div>
  );
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────────
export default function IlanVer() {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    fiyat: "",
    aciklama: "",
    takasIstegi: false,
    kategori: "",
    ulke: "Türkiye",
    sehir: "",
    ilce: "",
    mahalle: "",
    images: [] as string[],
    ozelAlanlar: {} as Record<string, any>,
  });

  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seçili kategorinin özel alanları
  const ozelAlanlar: OzelAlan[] = formData.kategori
    ? (SEKTOR_ALANLARI[formData.kategori] || VARSAYILAN_ALANLAR)
    : [];

  const setOzelAlan = (key: string, val: any) => {
    setFormData(p => ({ ...p, ozelAlanlar: { ...p.ozelAlanlar, [key]: val } }));
  };

  // Dosya yükleme
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const files = Array.from(e.target.files);
    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) { alert(`${file.name} 100MB'tan büyük!`); continue; }
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: data });
        const result = await res.json();
        if (result.secure_url) uploadedUrls.push(result.secure_url);
        else alert("Yükleme hatası: " + (result.error?.message || "Bilinmeyen"));
      }
      setFormData(p => ({ ...p, images: [...p.images, ...uploadedUrls] }));
    } catch { alert("Bağlantı hatası."); }
    finally { setIsUploading(false); }
  };

  // Form gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return alert("İşlem için giriş yapmalısınız!");
    if (formData.images.length === 0) return alert("En az bir görsel/video ekleyin!");
    if (!formData.kategori) return alert("Lütfen kategori seçin!");
    if (!formData.sehir) return alert("Lütfen şehir seçin!");

    // Zorunlu özel alan kontrolü
    for (const alan of ozelAlanlar) {
      if (alan.zorunlu) {
        const val = formData.ozelAlanlar[alan.key];
        if (!val || (typeof val === "string" && !val.trim())) {
          return alert(`"${alan.label}" alanı zorunludur.`);
        }
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/varlik-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baslik: formData.title,
          fiyat: Number(formData.fiyat),
          kategori: formData.kategori,
          ulke: formData.ulke,
          sehir: formData.sehir,
          ilce: formData.ilce,
          mahalle: formData.mahalle,
          aciklama: formData.aciklama,
          takasIstegi: formData.takasIstegi,
          resimler: formData.images,
          ozelAlanlar: formData.ozelAlanlar,
          sellerEmail: session.user.email,
          satici: session.user.email,
          saticiEmail: session.user.email,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({
          title: "", fiyat: "", aciklama: "", takasIstegi: false,
          kategori: "", ulke: "Türkiye", sehir: "", ilce: "", mahalle: "",
          images: [], ozelAlanlar: {},
        });
      } else {
        const err = await res.json();
        alert(`Hata: ${err.message || err.error || "Bilinmeyen"}`);
      }
    } catch { alert("Bağlantı hatası."); }
    finally { setLoading(false); }
  };

  const canSubmit = !loading && !isUploading && formData.images.length > 0 && !!formData.kategori && !!formData.sehir;

  return (
    <>
      <div style={{ minHeight: "100vh", background: cream, fontFamily: "var(--font-sans, 'DM Sans', sans-serif)", color: navy }}>

        {/* ── STICKY HEADER ─────────────────────────────── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 100, background: white,
          borderBottom: `1px solid ${border}`, padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => router.back()} style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `1.5px solid ${border}`, background: white,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 16, color: navy,
            }}>←</button>
            <div>
              <h1 style={{ fontFamily: "var(--font-display, serif)", fontSize: 20, fontWeight: 800, color: navy, letterSpacing: "-0.02em", margin: 0 }}>
                İlan Ver<span style={{ color: gold }}>.</span>
              </h1>
              <p style={{ fontSize: 11, color: textSoft, margin: 0 }}>Varlığınızı platformda yayınlayın</p>
            </div>
          </div>
          <button onClick={() => router.push("/")} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            background: white, border: `1px solid ${border}`, borderRadius: 10,
            fontSize: 12, fontWeight: 600, color: textSoft, cursor: "pointer", fontFamily: "inherit",
          }}>← Vitrine Dön</button>
        </div>

        {/* ── İÇERİK ───────────────────────────────────── */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{
            background: white, border: `1px solid ${border}`, borderRadius: 24,
            padding: "32px 28px", boxShadow: "0 4px 24px rgba(15,37,64,0.08)",
          }}>

            {/* BAŞARI EKRANI */}
            {success ? (
              <div style={{ textAlign: "center", padding: "48px 24px" }}>
                <CheckCircle size={64} style={{ color: "#16a34a", margin: "0 auto 20px", display: "block" }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: navy, marginBottom: 8 }}>İlan Başarıyla Yayınlandı!</h2>
                <p style={{ fontSize: 14, color: textSoft, marginBottom: 28 }}>İlanınız Borsa Vitrini'nde görüntülenmeye başladı.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => setSuccess(false)} style={{
                    padding: "12px 24px", background: white, border: `1.5px solid ${border}`,
                    borderRadius: 12, fontSize: 13, fontWeight: 700, color: navy, cursor: "pointer", fontFamily: "inherit",
                  }}>Yeni İlan Ver</button>
                  <button onClick={() => router.push("/")} style={{
                    padding: "12px 24px", background: navy, border: "none", borderRadius: 12,
                    fontSize: 13, fontWeight: 700, color: white, cursor: "pointer", fontFamily: "inherit",
                  }}>Vitrine Git →</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                {/* ── BÖLÜM 1: TEMEL BİLGİLER ─────────────── */}
                <div>
                  <p style={sectionTitle}><span>📋</span> Temel Bilgiler</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                    {/* Başlık */}
                    <div>
                      <label style={labelStyle}>İlan Başlığı *</label>
                      <input type="text" required
                        placeholder="Örn: iPhone 15 Pro 256GB Siyah — Sıfır Gibi"
                        value={formData.title}
                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                        maxLength={100}
                        style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = navy)}
                        onBlur={e => (e.target.style.borderColor = border)}
                      />
                      <p style={{ fontSize: 11, color: textSoft, marginTop: 4 }}>{formData.title.length}/100</p>
                    </div>

                    {/* Fiyat + Takas */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }} className="ilan-grid-2">
                      <div>
                        <label style={labelStyle}>Fiyat (₺) *</label>
                        <div style={{ position: "relative" }}>
                          <input type="text" inputMode="numeric" required
                            placeholder="0"
                            value={formData.fiyat}
                            onChange={e => setFormData(p => ({ ...p, fiyat: e.target.value.replace(/[^0-9]/g, "") }))}
                            style={{ ...inputStyle, fontWeight: 800, fontSize: 16, paddingRight: 36 }}
                            onFocus={e => (e.target.style.borderColor = navy)}
                            onBlur={e => (e.target.style.borderColor = border)}
                          />
                          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, fontWeight: 800, color: navy }}>₺</span>
                        </div>
                        {formData.fiyat && (
                          <p style={{ fontSize: 11, color: textSoft, marginTop: 4 }}>
                            Görünecek: <strong style={{ color: gold }}>{Number(formData.fiyat).toLocaleString("tr-TR")} ₺</strong>
                          </p>
                        )}
                      </div>

                      {/* Takas Toggle */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        background: formData.takasIstegi ? "#f0fdf4" : "#f5f7fa",
                        border: `1.5px solid ${formData.takasIstegi ? "#bbf7d0" : border}`,
                        borderRadius: 12, padding: "12px 16px", cursor: "pointer",
                        transition: "all 0.2s", whiteSpace: "nowrap",
                      }}
                        onClick={() => setFormData(p => ({ ...p, takasIstegi: !p.takasIstegi }))}
                      >
                        <div style={{
                          width: 40, height: 22, borderRadius: 11, position: "relative",
                          background: formData.takasIstegi ? "#16a34a" : "#d1d5db", flexShrink: 0,
                        }}>
                          <span style={{
                            position: "absolute", top: 3, left: formData.takasIstegi ? 21 : 3,
                            width: 16, height: 16, borderRadius: "50%", background: white,
                            transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: navy }}>🔄 Takas</div>
                          <div style={{ fontSize: 10, color: textSoft }}>{formData.takasIstegi ? "Kabul edilir" : "Yok"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 2: KATEGORİ ───────────────────── */}
                <div>
                  <p style={sectionTitle}><span>🏷️</span> Kategori Seçimi</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {KATEGORILER.map(grup => (
                      <details key={grup.grup} style={{ borderRadius: 12, border: `1.5px solid ${border}`, overflow: "hidden" }}
                        open={grup.secenekler.some(s => s === formData.kategori)}
                      >
                        <summary style={{
                          padding: "12px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer",
                          background: grup.secenekler.some(s => s === formData.kategori) ? "#f0efff" : "#f5f7fa",
                          color: grup.secenekler.some(s => s === formData.kategori) ? "#5a52d5" : navy,
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          listStyle: "none", userSelect: "none" as any,
                        }}>
                          <span>{grup.grup}</span>
                          <ChevronDown size={14} />
                        </summary>
                        <div style={{ padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 8, background: white }}>
                          {grup.secenekler.map(s => {
                            const secildi = formData.kategori === s;
                            return (
                              <button key={s} type="button"
                                onClick={() => setFormData(p => ({ ...p, kategori: s, ozelAlanlar: {} }))}
                                style={{
                                  padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                  cursor: "pointer", fontFamily: "inherit",
                                  border: secildi ? `2px solid ${navy}` : `2px solid ${border}`,
                                  background: secildi ? navy : white,
                                  color: secildi ? white : textSoft,
                                  transition: "all 0.15s",
                                }}
                              >
                                {secildi ? "✓ " : ""}{s.split(" - ")[1] || s}
                              </button>
                            );
                          })}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>

                {/* ── BÖLÜM 3: SEKTÖRE ÖZEL ALANLAR ──────── */}
                {ozelAlanlar.length > 0 && (
                  <div>
                    <p style={sectionTitle}>
                      <span>⚙️</span> {formData.kategori} — Detaylar
                    </p>
                    <div style={{
                      background: "#f9fafb", border: `1px solid ${border}`,
                      borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 16,
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ilan-grid">
                        {ozelAlanlar.map(alan => (
                          <div key={alan.key}
                            style={(alan.tip === "multiselect" || alan.tip === "textarea" || alan.tip === "boolean")
                              ? { gridColumn: "1 / -1" } : {}
                            }
                          >
                            <label style={{ ...labelStyle, color: alan.zorunlu ? navy : textSoft }}>
                              {alan.label}{alan.zorunlu && <span style={{ color: "#ef4444" }}> *</span>}
                            </label>
                            {renderOzelAlan(alan, formData.ozelAlanlar[alan.key], setOzelAlan)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BÖLÜM 4: AÇIKLAMA ───────────────────── */}
                <div>
                  <p style={sectionTitle}><span>📝</span> Açıklama</p>
                  <textarea required
                    placeholder="Ürününüzü detaylıca açıklayın. Takas şartlarınızı, ürünün geçmişini ve özel durumlarını belirtin..."
                    value={formData.aciklama}
                    onChange={e => setFormData(p => ({ ...p, aciklama: e.target.value }))}
                    maxLength={2000}
                    style={{ ...inputStyle, height: 130, resize: "none" as any, lineHeight: 1.7 }}
                    onFocus={e => (e.target.style.borderColor = navy)}
                    onBlur={e => (e.target.style.borderColor = border)}
                  />
                  <p style={{ fontSize: 11, color: textSoft, marginTop: 4 }}>{formData.aciklama.length}/2000</p>
                </div>

                {/* ── BÖLÜM 5: KONUM ──────────────────────── */}
                <div>
                  <div style={{ ...sectionTitle as any, marginBottom: 14 }}>
                    <MapPin size={14} style={{ color: gold }} />
                    <span>Konum Bilgisi</span>
                  </div>
                  <div style={{
                    background: "#f5f7fa", border: `1px solid ${border}`,
                    borderRadius: 16, padding: "20px",
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="ilan-grid">
                      <div>
                        <label style={labelStyle}>Ülke</label>
                        <input type="text" readOnly value="Türkiye"
                          style={{ ...inputStyle, color: textSoft, cursor: "not-allowed", background: "#eef3f8" }} />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, color: navy }}>Şehir *</label>
                        <select required value={formData.sehir}
                          onChange={e => setFormData(p => ({ ...p, sehir: e.target.value }))}
                          style={{ ...inputStyle, cursor: "pointer", appearance: "none" as any }}
                          onFocus={e => (e.target.style.borderColor = navy)}
                          onBlur={e => (e.target.style.borderColor = border)}
                        >
                          <option value="" disabled>Seçiniz...</option>
                          {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>İlçe *</label>
                        <input type="text" required placeholder="Örn: Muratpaşa"
                          value={formData.ilce}
                          onChange={e => setFormData(p => ({ ...p, ilce: e.target.value }))}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = navy)}
                          onBlur={e => (e.target.style.borderColor = border)}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Mahalle / Semt</label>
                        <input type="text" placeholder="Örn: Şirinyalı Mah."
                          value={formData.mahalle}
                          onChange={e => setFormData(p => ({ ...p, mahalle: e.target.value }))}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = navy)}
                          onBlur={e => (e.target.style.borderColor = border)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── BÖLÜM 6: MEDYA ──────────────────────── */}
                <div>
                  <p style={sectionTitle}><span>🖼️</span> Fotoğraf & Video</p>
                  <input type="file" accept="image/*,video/*" multiple
                    ref={fileInputRef} onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${border}`, borderRadius: 16,
                      padding: "32px 20px", textAlign: "center",
                      cursor: isUploading ? "not-allowed" : "pointer",
                      background: "#f9fafb", transition: "border-color 0.2s",
                      opacity: isUploading ? 0.6 : 1,
                    }}
                    onMouseEnter={e => { if (!isUploading) (e.currentTarget as HTMLElement).style.borderColor = navy; }}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = border}
                  >
                    <div style={{ width: 52, height: 52, background: "#eef3f8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      {isUploading
                        ? <Loader2 size={22} style={{ color: navy, animation: "spin 0.8s linear infinite" }} />
                        : <UploadCloud size={22} style={{ color: textSoft }} />
                      }
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: navy, marginBottom: 4 }}>
                      {isUploading ? "Yükleniyor..." : "Medya Yükle"}
                    </p>
                    <p style={{ fontSize: 11, color: textSoft }}>
                      Fotoğraf ve video · Max 100MB · {formData.images.length}/10
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <div style={{ display: "flex", gap: 10, marginTop: 14, overflowX: "auto", paddingBottom: 4 }}>
                      {formData.images.map((url, i) => (
                        <div key={i} style={{
                          position: "relative", width: 90, height: 82,
                          borderRadius: 12, overflow: "hidden",
                          border: i === 0 ? `2px solid ${navy}` : `1.5px solid ${border}`,
                          flexShrink: 0, background: "#f3f4f6",
                        }}>
                          {url.match(/\.(mp4|mov|webm)/) ? (
                            <video src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
                          ) : (
                            <img src={url} alt={`Medya ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                          {i === 0 && (
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(15,37,64,0.75)", color: white, fontSize: 9, fontWeight: 700, textAlign: "center", padding: 3 }}>
                              ANA FOTOĞRAF
                            </div>
                          )}
                          <button type="button"
                            onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                            style={{
                              position: "absolute", top: 4, right: 4, width: 20, height: 20,
                              background: "rgba(0,0,0,0.65)", border: "none", borderRadius: "50%",
                              color: white, cursor: "pointer", display: "flex",
                              alignItems: "center", justifyContent: "center", fontSize: 12,
                            }}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── GÖNDER ──────────────────────────────── */}
                <button type="submit" disabled={!canSubmit}
                  style={{
                    width: "100%", padding: "16px",
                    background: canSubmit ? gold : "#9ca3af",
                    border: "none", borderRadius: 14,
                    fontFamily: "inherit", fontSize: 15, fontWeight: 800,
                    color: canSubmit ? navy : white,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    letterSpacing: "0.02em", transition: "all 0.2s",
                    boxShadow: canSubmit ? "0 4px 16px rgba(201,168,76,0.4)" : "none",
                  }}
                >
                  <Zap size={17} />
                  {loading ? "İlan Yayınlanıyor..." : isUploading ? "Medya Yükleniyor..." : "İlanı Yayınla"}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        @media (max-width: 600px) {
          .ilan-grid { grid-template-columns: 1fr !important; }
          .ilan-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
