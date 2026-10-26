import type { Metadata } from "next";
export const metadata: Metadata = { title: "Kullanım şartları", description: "A-TAKASA kullanım şartları ve gizlilik bilgilendirmesi.", alternates: { canonical: "/sozlesme" } };

export default function Sozlesme() {
  return (
    <article className="prose mx-auto max-w-3xl space-y-6 text-slate-700">
      <h1 className="text-3xl font-extrabold text-slate-900">Kullanım şartları</h1>
      <section><h2 className="text-lg font-bold text-slate-900">1. Hizmetin niteliği</h2><p>A-TAKASA, üyelerin ihtiyaç fazlası eşyalarını birbirleriyle takas edebilmeleri için ilan yayınladıkları ücretsiz bir aracı platformdur. Satış, ödeme alma ve komisyon yoktur. Takas, taraflar arasındaki bir anlaşmadır; A-TAKASA ürünlerin durumundan, teslimattan veya tarafların davranışından sorumlu değildir.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900">2. Üyelik ve ilanlar</h2><ul className="list-disc pl-5"><li>Üye olmak için 18 yaşını doldurmuş olmanız gerekir.</li><li>İlandaki fotoğraf ve videolar size ait olmalı, açıklamalar doğru olmalıdır.</li><li>Çalıntı, yasadışı, tehlikeli, canlı hayvan, ruhsat gerektiren ve yasaklı ürünler ilan edilemez.</li><li>Kurallara uymayan ilan ve üyelikler haber verilmeden kaldırılabilir.</li></ul></section>
      <section><h2 className="text-lg font-bold text-slate-900">3. Güvenli takas önerileri</h2><p>Takası mümkünse kalabalık bir yerde ve yüz yüze yapın, ürünü teslim almadan önce kontrol edin, kimlik veya banka bilgisi paylaşmayın, takas öncesi para göndermeyin.</p></section>
      <section><h2 className="text-lg font-bold text-slate-900">4. Kişisel veriler</h2><p>E-posta ve (verdiyseniz) telefon numaranız yalnızca bir takas teklifi karşı taraf tarafından <b>kabul edildiğinde</b>, o takasın diğer tarafına gösterilir. Verileriniz üçüncü kişilere satılmaz. Hesabınızın silinmesi için bize e-posta ile ulaşabilirsiniz.</p></section>
    </article>
  );
}
