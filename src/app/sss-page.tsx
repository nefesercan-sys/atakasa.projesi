import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular — Takas & Satış | A-TAKASA",
  description:
    "A-TAKASA'da takas nasıl yapılır? Güvenli satış nasıl işliyor? Ödeme güvencesi nedir? Tüm sorularınızın cevabı burada.",
  openGraph: {
    title: "A-TAKASA SSS — Takas, Satış, Güvenlik",
    description: "Türkiye'nin güvenli takas platformu A-TAKASA hakkında merak ettiğiniz her şey.",
    url: "https://atakasa.com/sss",
  },
  alternates: { canonical: "https://atakasa.com/sss" },
};

const SORULAR = [
  {
    soru: "A-TAKASA'da takas nasıl yapılır?",
    cevap:
      "A-TAKASA'da takas yapmak çok kolay. İstediğiniz bir ilan bulun, 'Takas Teklifi' butonuna tıklayın ve kendi ilanlarınızdan birini seçip teklif gönderin. Karşı taraf kabul ederse takas işlemi başlar. Tüm süreç platform üzerinden güvenli şekilde yönetilir.",
  },
  {
    soru: "Ödeme güvencesi nasıl çalışıyor?",
    cevap:
      "A-TAKASA'nın Siber Kalkan sistemi, satın alma işlemlerinde ödemeyi güvenli bir havuzda tutar. Para, ürün teslim edildiğini onaylayana kadar satıcıya aktarılmaz. Bu sayede hem alıcı hem de satıcı korunmuş olur.",
  },
  {
    soru: "İlan vermek ücretli mi?",
    cevap:
      "A-TAKASA'da temel ilan vermek tamamen ücretsizdir. İstediğiniz kadar ürününüzü platforma ekleyebilir, satışa veya takasa sunabilirsiniz.",
  },
  {
    soru: "Hangi ürünleri satabilirim veya takas edebilirim?",
    cevap:
      "Elektronik, araç, emlak, mobilya, giyim, kitap, antika, el sanatları, doğal ürünler, petshop, oyun konsolu dahil 17 farklı kategoride işlem yapabilirsiniz. Yasal olmayan ürünler kesinlikle kabul edilmemektedir.",
  },
  {
    soru: "Satıcı güvenilir mi nasıl anlarım?",
    cevap:
      "A-TAKASA'da her satıcının profil sayfasında geçmiş işlemleri, aldığı değerlendirmeler ve onay rozeti görünür. Onaylı üye rozetine sahip satıcılar kimlik doğrulamasından geçmiştir.",
  },
  {
    soru: "İlanım ne kadar sürede yayınlanır?",
    cevap:
      "İlanınız eklendikten hemen sonra canlıya alınır. Fotoğraf yükleme dahil tüm süreç ortalama 2 dakika sürer.",
  },
  {
    soru: "Kargo süreci nasıl işliyor?",
    cevap:
      "Satıcı siparişi onayladıktan sonra ürünü kargoya verir ve takip kodunu platform üzerinden paylaşır. Alıcı kargonun durumunu panelinden anlık takip edebilir.",
  },
  {
    soru: "Takas anlaşmazlığında ne yapmalıyım?",
    cevap:
      "Herhangi bir sorun yaşarsanız A-TAKASA destek ekibine ulaşabilirsiniz. Tüm takas anlaşmazlıklarında platform arabuluculuk yapar ve kullanıcı haklarını korur.",
  },
  {
    soru: "Mobil uygulaması var mı?",
    cevap:
      "A-TAKASA tam mobil uyumlu bir web uygulamasıdır. Ana ekrana ekleyerek uygulama gibi kullanabilirsiniz. Ayrıca mobil tarayıcınızdan atakasa.com adresine girerek tüm özelliklere erişebilirsiniz.",
  },
  {
    soru: "Türkiye'nin her şehrinden ilan verebilir miyim?",
    cevap:
      "Evet. A-TAKASA Türkiye'nin 81 ilinden kullanıcılara hizmet vermektedir. İl ve ilçe bazlı arama yaparak size en yakın ilanları bulabilirsiniz.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SORULAR.map((s) => ({
    "@type": "Question",
    name: s.soru,
    acceptedAnswer: {
      "@type": "Answer",
      text: s.cevap,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://atakasa.com" },
    { "@type": "ListItem", position: 2, name: "Sık Sorulan Sorular", item: "https://atakasa.com/sss" },
  ],
};

export default function SSSPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 120px", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
        <nav style={{ fontSize: 12, color: "#8097b1", marginBottom: 32, display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/" style={{ color: "#8097b1", textDecoration: "none" }}>Ana Sayfa</a>
          <span>›</span>
          <span>Sık Sorulan Sorular</span>
        </nav>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f2540", letterSpacing: "-0.02em", marginBottom: 8, fontFamily: "var(--font-playfair, serif)" }}>
          Sık Sorulan Sorular
        </h1>
        <p style={{ color: "#8097b1", fontSize: 15, marginBottom: 48 }}>
          A-TAKASA hakkında merak ettiğiniz her şeyin cevabı
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SORULAR.map((item, i) => (
            <details key={i} style={{ background: "#fff", border: "1px solid #e8edf3", borderRadius: 14, overflow: "hidden" }}>
              <summary style={{
                padding: "20px 24px", cursor: "pointer", fontWeight: 700,
                fontSize: 15, color: "#0f2540", listStyle: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                {item.soru}
                <span style={{ fontSize: 20, color: "#c9a84c", flexShrink: 0, marginLeft: 16 }}>+</span>
              </summary>
              <div style={{ padding: "0 24px 20px", color: "#5a6a7e", fontSize: 14, lineHeight: 1.7 }}>
                {item.cevap}
              </div>
            </details>
          ))}
        </div>

        <div style={{ marginTop: 64, background: "linear-gradient(135deg, #0f2540, #1a3a5c)", borderRadius: 20, padding: "40px 32px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Hâlâ sorunuz mu var?</h2>
          <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24, fontSize: 14 }}>
            Destek ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
          <a
            href="mailto:destek@atakasa.com"
            style={{
              display: "inline-block", background: "#c9a84c", color: "#0f2540",
              padding: "12px 28px", borderRadius: 12, fontWeight: 800,
              fontSize: 14, textDecoration: "none",
            }}
          >
            destek@atakasa.com
          </a>
        </div>
      </div>
    </>
  );
}
