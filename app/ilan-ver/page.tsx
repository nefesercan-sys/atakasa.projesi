"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IlanVerSayfasi() {
  const router = useRouter();
  
  // Form verilerini tutacağımız stateler
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [sehir, setSehir] = useState("");
  const [kategori, setKategori] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  // Türkiye'nin büyük illeri (Listeyi dilediğin gibi uzatabilirsin)
  const sehirler = [
    "Adana", "Ankara", "Antalya", "Bursa", "Diyarbakır", 
    "Erzurum", "Eskişehir", "Gaziantep", "İstanbul", "İzmir", 
    "Kayseri", "Kocaeli", "Konya", "Mersin", "Samsun", "Trabzon", "Şanlıurfa"
  ];

  // Hizmet ve Meslek Grupları
  const kategoriler = [
    "Web & Yazılım Geliştirme",
    "Grafik & Tasarım",
    "Ev Temizliği",
    "Nakliyat & Lojistik",
    "Tadilat & Dekorasyon",
    "Özel Ders & Eğitim",
    "Danışmanlık Hizmetleri",
    "Tamir & Teknik Servis",
    "Diğer Hizmetler"
  ];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setYukleniyor(true);
    
    // API bağlantısı yapılana kadar simülasyon (Render burada hata vermez)
    setTimeout(() => {
      alert("Harika! İlanınız başarıyla sisteme gönderildi.");
      setYukleniyor(false);
      router.push("/"); // İşlem bitince ana sayfaya yollar
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black italic mb-4">Yeni İlan <span className="text-cyan-500">Oluştur</span>.</h1>
          <p className="text-gray-400 text-sm">Hizmetinizi veya talebinizi binlerce kişiye ulaştırmak için aşağıdaki formu eksiksiz doldurun.</p>
        </div>

        {/* Form Alanı */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Arka plan parlama efekti */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* İlan Başlığı */}
            <div>
              <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">İlan Başlığı</label>
              <input 
                type="text" 
                required 
                value={baslik} 
                onChange={(e) => setBaslik(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="Örn: E-Ticaret Sitesi Yaptırılacak" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kategori Seçimi */}
              <div>
                <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Hizmet Kategorisi</label>
                <select 
                  required 
                  value={kategori} 
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Kategori Seçin</option>
                  {kategoriler.map((kat, index) => (
                    <option key={index} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              {/* Şehir Seçimi */}
              <div>
                <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Bulunduğunuz İl</label>
                <select 
                  required 
                  value={sehir} 
                  onChange={(e) => setSehir(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Şehir Seçin</option>
                  {sehirler.map((il, index) => (
                    <option key={index} value={il}>{il}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fiyat / Bütçe */}
            <div>
              <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Bütçe veya Fiyat (₺)</label>
              <input 
                type="number" 
                required 
                value={fiyat} 
                onChange={(e) => setFiyat(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="Örn: 5000" 
              />
            </div>

            {/* Detaylı Açıklama */}
            <div>
              <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">İlan Detayları</label>
              <textarea 
                required 
                value={aciklama} 
                onChange={(e) => setAciklama(e.target.value)} 
                rows={5} 
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition-colors" 
                placeholder="İşin veya hizmetin tüm detaylarını buraya yazın..."
              ></textarea>
            </div>

            {/* Gönder Butonu */}
            <button 
              type="submit" 
              disabled={yukleniyor}
              className={`w-full text-slate-950 text-sm font-black uppercase tracking-widest p-5 rounded-xl transition-all shadow-lg mt-4 ${yukleniyor ? 'bg-cyan-700 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20'}`}
            >
              {yukleniyor ? 'Sisteme Yükleniyor...' : 'İlanı Yayına Al'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
