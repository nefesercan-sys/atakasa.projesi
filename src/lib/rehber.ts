export type RehberKonu = {
  slug: string;
  baslik: string;
  ozet: string;
  kategori?: string;
  anahtar: string[];
  bolumler: { h: string; p: string[] }[];
  sss: { s: string; c: string }[];
};

const ORTAK_GUVENLIK = "Eşyayı görmeden ve kontrol etmeden onay vermeyin. Para transferi veya ön ödeme isteyenlerden uzak durun; takas yüz yüze, güvenli bir yerde yapılmalıdır.";

export const REHBER: RehberKonu[] = [
  {
    slug: "telefon-takasi",
    baslik: "Telefon Takası Nasıl Yapılır?",
    ozet: "Kullanmadığın telefonu başka bir telefon veya eşyayla takas etmek için adımlar, kontrol listesi ve güvenlik ipuçları.",
    kategori: "telefon-tablet",
    anahtar: ["telefon takası", "telefon takas et", "ikinci el telefon takas", "iphone takas", "samsung takas"],
    bolumler: [
      { h: "Telefonunu ilana hazırla", p: ["Modelini, depolama kapasitesini, rengini ve genel durumunu yaz. Ekran, arka kapak ve kenarların net fotoğraflarını ekle; çizik veya kırık varsa gizleme.", "Karşılığında istediğin telefonu veya eşyayı 'Karşılığında ne istiyorum?' alanına yaz. Ne kadar net yazarsan uygun teklifler o kadar hızlı gelir."] },
      { h: "Teslim almadan önce kontrol et", p: ["Telefonu açıp ekranı, dokunmatiği, kamerayı, hoparlörü, mikrofonu ve şarj girişini dene.", "IMEI numarasını cihaz ayarlarından ve kutu veya etiketten karşılaştır. Hesap kilidi (iCloud, Google hesabı gibi) kapalı olmalı; cihazı yeni sahibi olarak ayarlayabildiğinden emin ol."] },
      { h: "Güvenli buluşma", p: [ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "İkinci el telefon takasında nelere bakmalıyım?", c: "Ekran, kamera, ses, şarj girişi ve pil performansına bakın; IMEI numarasını kontrol edin ve hesap kilidinin kaldırıldığından emin olun." },
      { s: "Telefonu aksesuar veya başka eşyayla takas edebilir miyim?", c: "Evet. A-Takasa'da karşılığında ne istediğinizi serbestçe yazabilirsiniz; telefonunuzu başka bir telefon, tablet, saat veya farklı bir eşyayla değiştirebilirsiniz." },
    ],
  },
  {
    slug: "araba-takasi",
    baslik: "Araba ve Araç Takası Nasıl Yapılır?",
    ozet: "Araba, motosiklet ve bisiklet takasında ilan hazırlama, kontrol edilecek belgeler ve resmî devir süreci hakkında bilgiler.",
    kategori: "otomobil-vasita",
    anahtar: ["araba takası", "araç takas", "otomobil takas", "araba takas et", "motor takas"],
    bolumler: [
      { h: "İlanda neleri yazmalı?", p: ["Marka, model, yıl, kilometre, yakıt ve vites tipi gibi temel bilgileri yaz. Dış, iç ve motor bölümünün fotoğraflarını ekle; boya, değişen parça veya hasar kaydı varsa dürüstçe belirt.", "Karşılığında hangi tür aracı veya eşyayı istediğini açıkça yaz. Fark ödemesi gibi şartlar varsa teklif aşamasında konuşun; A-Takasa para transferi yapmaz."] },
      { h: "Kontrol edilecekler", p: ["Ruhsat bilgileri, hasar ve kilometre kaydı, bakım geçmişi ve varsa eksper raporu yazılı kontrol edilmelidir. Mümkünse aracı bağımsız bir ekspertize götürün."] },
      { h: "Resmî devir", p: ["Araç devri noter veya ilgili resmî kanallarda yapılır. A-Takasa yalnızca tarafları buluşturur; devir işlemi ve sorumluluk taraflara aittir.", ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "Araba takası nasıl yapılır?", c: "Aracınızı ilan edin, karşılığında ne istediğinizi yazın, gelen teklifleri değerlendirin. Anlaştığınızda aracı birlikte kontrol edin ve devri noter veya ilgili resmî kanallarda yapın." },
      { s: "Araç takasında A-Takasa devir işlemini yapar mı?", c: "Hayır. A-Takasa alıcı ve satıcıyı buluşturan bir ilan sitesidir; devir işlemi, belge kontrolü ve ödeme sorumluluğu taraflara aittir." },
    ],
  },
  {
    slug: "ev-takasi",
    baslik: "Ev, Daire ve Arsa Takası Nasıl Yapılır?",
    ozet: "Ev, daire, yazlık ve arsa takasında ilan verme, tapu kontrolü ve resmî işlem süreci hakkında genel bilgiler.",
    kategori: "emlak",
    anahtar: ["ev takası", "daire takas", "arsa takas", "yazlık takas", "emlak takas"],
    bolumler: [
      { h: "İlan nasıl hazırlanır?", p: ["Taşınmazın türünü, konumunu (il, ilçe), büyüklüğünü ve genel durumunu yaz. Net fotoğraflar ekle. Karşılığında ne istediğini (başka bir ev, arsa, araç veya farklı bir eşya) açıkça belirt."] },
      { h: "Resmî süreç", p: ["Taşınmaz takası tapu müdürlüğünde resmî işlemle tamamlanır. İşlemden önce tapu kaydını, imar durumunu, ipotek, haciz veya şerh olup olmadığını kontrol edin.", "Değer farkı ve masraflar önceden yazılı olarak netleştirilmelidir. Önemli işlemlerde bir avukat veya gayrimenkul uzmanından destek almanız önerilir."] },
      { h: "Güvenlik", p: ["A-Takasa tapu devri veya ödeme işlemi yapmaz. Ön ödeme veya kapora isteyenlere karşı dikkatli olun; taşınmazı yerinde görmeden işlem yapmayın."] },
    ],
    sss: [
      { s: "Ev takası nasıl yapılır?", c: "Taşınmazı ilan edin, karşılığında ne istediğinizi yazın ve teklifleri değerlendirin. Anlaşınca tapu ve diğer kayıtları kontrol edin; devri tapu müdürlüğünde resmî olarak yapın." },
      { s: "A-Takasa üzerinden tapu devri yapılır mı?", c: "Hayır. A-Takasa yalnızca ilan ve teklif platformudur; tapu devri tapu müdürlüğünde, taraflar tarafından yapılır." },
    ],
  },
  {
    slug: "saat-takasi",
    baslik: "Saat Takası Nasıl Yapılır?",
    ozet: "Kol saati ve akıllı saat takasında ilan hazırlama, orijinallik kontrolü ve güvenli buluşma önerileri.",
    kategori: "saat-taki",
    anahtar: ["saat takası", "kol saati takas", "saat takas et", "ikinci el saat takas"],
    bolumler: [
      { h: "İlanını güçlendir", p: ["Marka, model, çap, kordon tipi ve genel durumu yaz. Kadran, kasa ve arka kapak fotoğrafları ekle. Kutu, belge veya fatura varsa belirt."] },
      { h: "Orijinallik ve çalışma kontrolü", p: ["Saatin çalıştığını, kurulum ve tarih fonksiyonlarının doğru olduğunu birlikte kontrol edin. Değerli saatlerde bir saat ustası veya yetkili servis görüşü almak güvenlidir."] },
      { h: "Güvenli buluşma", p: [ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "Saat takasında nelere dikkat edilmeli?", c: "Saatin orijinal olup olmadığı, çalışma durumu, kasa ve cam üzerindeki çizikler ile kutu ve belgelerin bulunup bulunmadığı kontrol edilmelidir." },
    ],
  },
  {
    slug: "cakmak-koleksiyon-takasi",
    baslik: "Çakmak ve Koleksiyon Takası",
    ozet: "Çakmak, antika, para, pul ve plak gibi koleksiyon eşyalarını takas etmek isteyenler için rehber.",
    kategori: "koleksiyon",
    anahtar: ["çakmak takas", "koleksiyon takas", "antika takas", "plak takas", "para pul takas"],
    bolumler: [
      { h: "Koleksiyon ilanında nelere yer verilmeli?", p: ["Parçanın adı, dönemi veya üretim yılı, markası ve durumu açıkça yazılmalı. Birden fazla açıdan net fotoğraf eklemek güveni artırır.", "Karşılığında hangi parçayı veya eşyayı istediğini yaz; benzer koleksiyonla ilgilenenler seni daha kolay bulur."] },
      { h: "Durum ve orijinallik", p: ["Koleksiyon eşyalarında kondisyon ve orijinallik değeri belirler. Parçayı yüz yüze görerek karşılaştırın; emin değilseniz bir uzmana danışın."] },
      { h: "Güvenli buluşma", p: [ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "Çakmak gibi koleksiyon ürünlerini takas edebilir miyim?", c: "Evet. Çakmak, antika, para, pul, plak ve benzeri koleksiyon eşyaları için ilan verebilir ve karşılığında istediğin eşyayı yazabilirsin." },
    ],
  },
  {
    slug: "mobilya-takasi",
    baslik: "Mobilya ve Ev Eşyası Takası",
    ozet: "Koltuk, yatak, masa ve ev eşyalarını takas ederken ilan hazırlama, ölçü ve taşıma konularında ipuçları.",
    kategori: "mobilya",
    anahtar: ["mobilya takası", "koltuk takas", "yatak takas", "ev eşyası takas", "ikinci el mobilya takas"],
    bolumler: [
      { h: "Ölçü ve durum", p: ["Mobilyanın ölçülerini, rengini, malzemesini ve yaşını yaz. Genel görüntü ve varsa kusurların yakın fotoğrafını ekle."] },
      { h: "Taşıma ve teslim", p: ["Mobilya takasında taşıma ve söküm-montaj konusunu baştan konuşun; nakliyeyi kimin yapacağı ve masrafın kime ait olduğu net olmalı. Teslim anında birlikte kontrol edin."] },
      { h: "Güvenli buluşma", p: [ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "Mobilya takası yaparken taşımayı kim yapar?", c: "Taşıma ve montaj konusunu takas öncesinde taraflar kendi aralarında netleştirmelidir; A-Takasa taşıma hizmeti vermez." },
    ],
  },
  {
    slug: "esyami-satamiyorsun",
    baslik: "Satamadığın Eşyayı Takas Et: İhtiyaç Fazlası Eşya Değerlendirme",
    ozet: "Eşyan satılmıyorsa veya ihtiyaç fazlasıysa, onu ihtiyacın olan bir şeyle takas etmenin yolları.",
    anahtar: ["eşya satamıyorum", "kullanmadığım eşya ne yapılır", "ihtiyaç fazlası eşya", "eşya takas et", "ikinci el eşya değerlendirme"],
    bolumler: [
      { h: "Satmak yerine takas", p: ["Evde kullanılmayan bir eşya bazen satılamaz ya da istediğin fiyata satılmaz. Takasta ise önemli olan bir fiyat değil, ihtiyacın olan bir eşyaya ulaşmaktır.", "A-Takasa'da eşyanı ilan eder, karşılığında ne istediğini yazarsın; ilgilenenler kendi eşyalarını teklif eder."] },
      { h: "Eşleşme şansını artırma", p: ["Net fotoğraf ve video ekle, durumu dürüstçe yaz, karşılığında istediğini açık belirt ve şehrini seç. Birden fazla ilan vererek farklı tekliflere açık olabilirsin."] },
      { h: "Güvenli takas", p: [ORTAK_GUVENLIK] },
    ],
    sss: [
      { s: "Kullanmadığım eşyayı nasıl değerlendiririm?", c: "Eşyanın fotoğrafını ekleyip A-Takasa'da ilan verebilir, karşılığında ihtiyacın olan başka bir eşyayı yazabilirsin. Gelen teklifleri değerlendirip uygun olanı kabul edersin." },
    ],
  },
  {
    slug: "guvenli-takas",
    baslik: "Güvenli Takas İçin 10 İpucu",
    ozet: "İkinci el takasta dolandırıcılığa karşı korunmak ve takasın sorunsuz tamamlanması için pratik öneriler.",
    anahtar: ["güvenli takas", "takas dolandırıcılık", "ikinci el takas güvenlik", "takas yaparken dikkat"],
    bolumler: [
      { h: "Önce ilanı incele", p: ["Fotoğrafları ve açıklamayı dikkatle oku, eksik veya tutarsız bilgi varsa sor. Karşı tarafın profilinde tamamlanan takas sayısına bak."] },
      { h: "Buluşma", p: ["Kalabalık ve aydınlık bir yerde, tercihen gündüz buluş. Mümkünse yanında biriyle git. Eşyayı görmeden ve kontrol etmeden onay verme."] },
      { h: "Para ve belge", p: ["Ön ödeme, kapora veya havale isteyen kişilere dikkat et. Değerli ürünlerde fatura, garanti veya sahiplik belgesi iste. Araç ve taşınmazda devir işlemini resmî kanallarda yap."] },
      { h: "Takası tamamla", p: ["Eşyaları teslim aldıktan sonra iki taraf da A-Takasa'da 'Takas gerçekleşti' onayını verir. Şüpheli bir durumda takası iptal etmekten çekinme."] },
    ],
    sss: [
      { s: "Takas sırasında para göndermem gerekir mi?", c: "Hayır. A-Takasa'da ödeme alınmaz; ön ödeme veya havale isteyen kişilere karşı dikkatli olun." },
    ],
  },
];

export const rehberBul = (slug?: string) => REHBER.find((r) => r.slug === slug);
