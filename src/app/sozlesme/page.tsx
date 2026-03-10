"use client";
import React from "react";
import { ShieldCheck, AlertTriangle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SozlesmeSayfasi() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-6 md:px-12 selection:bg-[#00f260] selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık Alanı */}
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <ShieldCheck className="w-12 h-12 text-[#00f260]" />
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Yasal Kalkan</h1>
            <p className="text-slate-400 text-sm tracking-widest uppercase mt-1">Kullanıcı Sözleşmesi ve KVKK Aydınlatma Metni</p>
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          
          <section className="bg-white/5 p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><AlertTriangle className="text-amber-500" /> 1. Yer Sağlayıcı Beyanı (Kritik)</h2>
            <p>
              <strong>Atakasa.com</strong>, 5651 sayılı "İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun" kapsamında bir <strong>"Yer Sağlayıcı"</strong> olarak faaliyet göstermektedir.
            </p>
            <p className="mt-4 text-red-400 font-bold">
              Atakasa.com, platformda kullanıcılar tarafından oluşturulan ilanların, ürünlerin, hizmetlerin veya takas tekliflerinin gerçekliğini, güvenilirliğini, kalitesini veya yasallığını kontrol etmekle yükümlü DEĞİLDİR. Taraflar arasında gerçekleşecek her türlü takas, alışveriş veya iletişim tamamen kullanıcıların kendi sorumluluğundadır. Atakasa.com doğabilecek maddi/manevi zararlardan sorumlu tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4">2. Kullanım Koşulları</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Platforma 18 yaşından küçüklerin üye olması ve işlem yapması yasaktır.</li>
              <li>Çalıntı, yasadışı, kaçak veya Türkiye Cumhuriyeti kanunlarına aykırı hiçbir ürün platformda sergilenemez ve takas edilemez.</li>
              <li>Atakasa.com, kurallara uymayan kullanıcıların hesaplarını önceden haber vermeksizin askıya alma veya tamamen silme hakkını (God Mode) saklı tutar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2"><FileText className="text-cyan-400" /> 3. KVKK ve Gizlilik Politikası</h2>
            <p className="text-sm mb-4">
              Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, sisteme kayıt olurken verdiğiniz e-posta adresiniz ve IP bilgileriniz, yalnızca sistemin güvenliğini sağlamak ve sizinle iletişim kurmak amacıyla şifrelenmiş veritabanlarımızda saklanmaktadır. 
            </p>
            <p className="text-sm">
              Bu veriler hiçbir şekilde 3. şahıslara veya reklam şirketlerine SATILMAZ. Verilerinizin tamamen silinmesini talep etmek için iletişim kanallarımızdan bize ulaşabilirsiniz.
            </p>
          </section>
        </div>

        {/* Geri Dön Butonu */}
        <div className="mt-16 text-center">
          <button 
            onClick={() => router.push("/")}
            className="bg-[#00f260] text-black px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,242,96,0.3)]"
          >
            Sisteme Geri Dön
          </button>
        </div>

      </div>
    </div>
  );
}
