export type Kategori = {
  slug: string;
  ad: string;
  emoji: string;
  /** Kısa tanım: meta açıklama ve sayfa girişinde kullanılır */
  tanim: string;
  /** Bu kategoride takas edilen örnek eşyalar */
  ornekler: string[];
  /** Güvenli takas için kategoriye özel ipucu */
  ipucu: string;
  /** Arama niyetini karşılayan ek anahtar ifadeler */
  anahtar: string[];
};

export const KATEGORILER: Kategori[] = [
  {
    slug: "telefon-tablet", ad: "Telefon & Tablet", emoji: "📱",
    tanim: "Cep telefonu, akıllı telefon ve tablet takas ilanları. Kullanmadığın telefonu ilan et, istediğin modelle takas et.",
    ornekler: ["Akıllı telefon", "Tablet", "Akıllı saat", "Kulaklık", "Şarj aleti ve aksesuar"],
    ipucu: "Telefonu teslim almadan önce açıp ekranı, kamerayı ve şarj girişini deneyin; IMEI numarasının cihazın kutusu ve ayarlarındaki ile aynı olduğuna bakın.",
    anahtar: ["telefon takası", "ikinci el telefon takas", "telefon takas et", "iphone takas", "samsung takas", "tablet takas"],
  },
  {
    slug: "elektronik", ad: "Elektronik", emoji: "💻",
    tanim: "Bilgisayar, laptop, televizyon, kamera ve diğer elektronik eşyalar için ücretsiz takas ilanları.",
    ornekler: ["Laptop", "Masaüstü bilgisayar", "Televizyon", "Fotoğraf makinesi", "Hoparlör ve ses sistemi"],
    ipucu: "Cihazı çalışır halde görmeden onay vermeyin; seri numarasını ve varsa fatura veya garanti belgesini sorun.",
    anahtar: ["elektronik eşya takası", "laptop takas", "bilgisayar takas", "televizyon takas", "kamera takas"],
  },
  {
    slug: "otomobil-vasita", ad: "Araba & Vasıta", emoji: "🚗",
    tanim: "Otomobil, motosiklet, bisiklet ve diğer araçlar için takas ilanları. Aracını ilan et, istediğin araçla takas teklifi al.",
    ornekler: ["Otomobil", "Motosiklet", "Scooter", "Bisiklet", "Elektrikli scooter"],
    ipucu: "Araç takasında ruhsat, hasar ve kilometre bilgisini yazılı kontrol edin; araç devri noter veya ilgili resmî kanallarda yapılır, A-Takasa devir işlemi yapmaz.",
    anahtar: ["araba takası", "araç takas", "otomobil takas", "motor takas", "araba takas et", "araç takası nasıl yapılır"],
  },
  {
    slug: "emlak", ad: "Ev & Emlak", emoji: "🏡",
    tanim: "Ev, daire, arsa ve yazlık takası ilanları. Mülkünü ilan et, karşılığında istediğini yaz; teklifleri değerlendir.",
    ornekler: ["Daire", "Yazlık", "Arsa", "Tarla", "Dükkan"],
    ipucu: "Taşınmaz takası yalnızca tapu müdürlüğünde resmî işlemle tamamlanır; tapu kaydını, imar durumunu ve varsa ipotek veya haciz bilgisini işlem öncesi kontrol edin. A-Takasa tapu devri yapmaz.",
    anahtar: ["ev takası", "daire takas", "arsa takas", "yazlık takas", "emlak takas", "ev takas et"],
  },
  {
    slug: "saat-taki", ad: "Saat & Takı", emoji: "⌚",
    tanim: "Kol saati, cep saati, takı ve aksesuar takas ilanları. Kullanmadığın saati istediğin bir eşyayla takas et.",
    ornekler: ["Kol saati", "Akıllı saat", "Yüzük ve kolye", "Gözlük", "Cüzdan ve çanta"],
    ipucu: "Saat ve takıda orijinallik önemlidir; kutu, belge ve fatura varsa görmek isteyin, değerli ürünlerde bir uzmana kontrol ettirin.",
    anahtar: ["saat takası", "kol saati takas", "saat takas et", "takı takas", "ikinci el saat takas"],
  },
  {
    slug: "koleksiyon", ad: "Koleksiyon & Çakmak", emoji: "🧿",
    tanim: "Çakmak, antika, para, pul, plak ve koleksiyon eşyaları için takas ilanları.",
    ornekler: ["Çakmak", "Antika eşya", "Para ve pul", "Plak ve kaset", "Figür ve kart koleksiyonu"],
    ipucu: "Koleksiyon parçalarında durum ve orijinallik fiyatı belirler; net fotoğraf isteyin ve parçayı yüz yüze görerek karşılaştırın.",
    anahtar: ["çakmak takas", "koleksiyon takas", "antika takas", "plak takas", "para pul takas"],
  },
  {
    slug: "mobilya", ad: "Mobilya", emoji: "🛋️",
    tanim: "Koltuk, yatak, masa, dolap ve her türlü mobilya için ücretsiz takas ilanları.",
    ornekler: ["Koltuk takımı", "Yatak ve baza", "Yemek masası", "Gardırop", "Sandalye ve kitaplık"],
    ipucu: "Mobilyanın ölçülerini ve taşıma şartlarını önceden konuşun; teslim anında yırtık, çizik ve kırıkları birlikte kontrol edin.",
    anahtar: ["mobilya takası", "koltuk takas", "yatak takas", "ikinci el mobilya takas", "ev eşyası takas"],
  },
  {
    slug: "beyaz-esya", ad: "Beyaz Eşya", emoji: "🧺",
    tanim: "Buzdolabı, çamaşır makinesi, bulaşık makinesi, fırın ve diğer beyaz eşyalar için takas ilanları.",
    ornekler: ["Buzdolabı", "Çamaşır makinesi", "Bulaşık makinesi", "Fırın ve ocak", "Klima"],
    ipucu: "Beyaz eşyayı çalışırken görün; marka, model ve yaş bilgisini sorun, taşıma ve kurulum için kimin sorumlu olacağını baştan netleştirin.",
    anahtar: ["beyaz eşya takas", "buzdolabı takas", "çamaşır makinesi takas", "klima takas"],
  },
  {
    slug: "ev-yasam", ad: "Ev & Yaşam", emoji: "🏠",
    tanim: "Mutfak gereçleri, dekorasyon, küçük ev aletleri ve günlük yaşam eşyaları için takas ilanları.",
    ornekler: ["Küçük ev aletleri", "Mutfak eşyaları", "Dekorasyon ürünleri", "Halı ve perde", "Aydınlatma"],
    ipucu: "Küçük ev aletlerinde cihazı fişe takıp çalıştığını görün; eksik parça veya aksesuar olup olmadığını kontrol edin.",
    anahtar: ["ev eşyası takas", "ev yaşam takas", "halı takas", "mutfak eşyası takas"],
  },
  {
    slug: "giyim", ad: "Giyim & Aksesuar", emoji: "👕",
    tanim: "Kıyafet, ayakkabı, çanta ve aksesuar takas ilanları. Giymediğin kıyafeti başka bir ürünle değiştir.",
    ornekler: ["Mont ve ceket", "Ayakkabı", "Çanta", "Abiye ve gelinlik", "Spor giyim"],
    ipucu: "Beden ve ölçüyü ilanda belirtin; kıyafeti denemeden onaylamayın.",
    anahtar: ["kıyafet takas", "giysi takas", "ayakkabı takas", "çanta takas", "ikinci el giyim takas"],
  },
  {
    slug: "bebek-cocuk", ad: "Bebek & Çocuk", emoji: "🧸",
    tanim: "Bebek arabası, oyuncak, çocuk kıyafeti ve çocuk eşyaları için takas ilanları. Çocuğun büyüdükçe eşyaları değiştir.",
    ornekler: ["Bebek arabası", "Oto koltuğu", "Oyuncak", "Çocuk kıyafeti", "Beşik ve park yatak"],
    ipucu: "Bebek ve çocuk ürünlerinde güvenlik önemlidir; oto koltuğu ve beşik gibi ürünlerde kırık, çatlak ve eksik parça olmadığından emin olun.",
    anahtar: ["bebek eşyası takas", "bebek arabası takas", "oyuncak takas", "çocuk eşyası takas"],
  },
  {
    slug: "spor-outdoor", ad: "Spor & Outdoor", emoji: "🚴",
    tanim: "Bisiklet, fitness aleti, kamp ve outdoor ekipmanları için takas ilanları.",
    ornekler: ["Bisiklet", "Koşu bandı", "Çadır ve kamp malzemesi", "Spor ekipmanı", "Balıkçılık malzemeleri"],
    ipucu: "Spor aletlerinde ve bisikletlerde fren, vites ve taşıyıcı parçaların durumuna bakın; mümkünse kısa bir deneme yapın.",
    anahtar: ["bisiklet takas", "spor aleti takas", "kamp malzemesi takas", "outdoor takas"],
  },
  {
    slug: "kitap-hobi", ad: "Kitap & Hobi", emoji: "📚",
    tanim: "Kitap, müzik aleti, hobi malzemesi ve oyun için takas ilanları.",
    ornekler: ["Kitap seti", "Gitar ve müzik aletleri", "Resim malzemeleri", "Masa oyunları", "Hobi ekipmanları"],
    ipucu: "Kitap ve hobi ürünlerinde eksik cilt veya parça olmadığından emin olun; müzik aletlerinde sesi birlikte deneyin.",
    anahtar: ["kitap takas", "müzik aleti takas", "gitar takas", "hobi malzemesi takas"],
  },
  {
    slug: "arac-yedek-parca", ad: "Araç Yedek Parça", emoji: "🔧",
    tanim: "Jant, lastik, oto aksesuar ve yedek parça takas ilanları.",
    ornekler: ["Jant ve lastik", "Oto ses sistemi", "Yedek parça", "Çeki demiri", "Araç aksesuarları"],
    ipucu: "Parçanın aracınızla uyumlu olduğundan emin olun; marka, model, yıl ve parça numarasını karşılaştırın.",
    anahtar: ["yedek parça takas", "jant takas", "lastik takas", "oto aksesuar takas"],
  },
  {
    slug: "bahce-yapi", ad: "Bahçe & Yapı Market", emoji: "🌿",
    tanim: "Bahçe aletleri, el aletleri, yapı malzemeleri ve hırdavat ürünleri için takas ilanları.",
    ornekler: ["Çim biçme makinesi", "El ve elektrikli aletler", "Bahçe mobilyası", "Yapı malzemesi", "Jeneratör"],
    ipucu: "Aletleri çalışırken görün; ağır veya tehlikeli ürünlerde taşıma ve kullanım güvenliğini önceden konuşun.",
    anahtar: ["bahçe aleti takas", "el aleti takas", "yapı malzemesi takas", "jeneratör takas"],
  },
  {
    slug: "oyun-konsol", ad: "Oyun & Konsol", emoji: "🎮",
    tanim: "PlayStation, Xbox, Nintendo, oyun ve oyun aksesuarları için takas ilanları.",
    ornekler: ["PlayStation", "Xbox", "Nintendo", "Oyun diski", "Oyun kolu ve aksesuar"],
    ipucu: "Konsolu teslim almadan açıp oyun oynatarak test edin; ek kol ve kabloların teslim edildiğini kontrol edin.",
    anahtar: ["konsol takas", "playstation takas", "xbox takas", "oyun takas"],
  },
  {
    slug: "diger", ad: "Diğer", emoji: "📦",
    tanim: "Diğer kategorilere girmeyen her türlü eşya için takas ilanları.",
    ornekler: ["Ofis malzemeleri", "El işi ürünler", "Müzik ve ses ekipmanı", "Evcil hayvan malzemeleri", "Her türlü eşya"],
    ipucu: "İlanda eşyanın durumunu ve karşılığında ne istediğinizi açık yazın; eşleşme şansı artar.",
    anahtar: ["eşya takası", "her şey takas", "takas ilanları"],
  },
];

export type KategoriSlug = string;
export const kategoriBul = (slug?: string) => KATEGORILER.find((k) => k.slug === slug);
export const KATEGORI_SLUGLARI: string[] = KATEGORILER.map((k) => k.slug);
