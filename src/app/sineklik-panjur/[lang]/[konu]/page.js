import { notFound } from "next/navigation";
import Link from "next/link";
import LikyaLogo from "@/components/sineklik/LikyaLogo";
import SpIllustration from "@/components/sineklik/SpIllustration";
import { spIsRtl as isRtl, SP_OG_LOCALE as OG_LOCALE } from "@/lib/sineklik-panjur";
import { IMAGES, IMG_W, IMG_H, HERO_INDEX, EXTRA } from "@/lib/likya-home";
import { COPY, SP_LANGS, SP_BASE, SP_BRAND, SP_CITY, SP_PHONE_DISPLAY, SP_PHONE_TEL, spPath, spWhatsapp, spBusiness } from "@/lib/sineklik-panjur";
import { lastMod } from "@/lib/lastmod";
import Image from "next/image";

/** Başlık 60 karakteri aşarsa sondaki " | Likya Home" atılır (Google'da yarım görünmesin; marka og:site_name'de). */
const fitTitle = (t) => (t.length > 60 ? t.replace(/\s*\|\s*Likya Home$/, "") : t);
import { KONULAR, KONU_IDS, KUI, konuBul, konuMetni } from "@/lib/likya-konular";

// Ürün ve bölge sayfaları: /sineklik-panjur/<dil>/<konu> — 10 dil × 8 konu, hepsi derleme anında üretilir.
export const dynamicParams = false;

export function generateStaticParams() {
  return SP_LANGS.flatMap((lang) => KONU_IDS.map((konu) => ({ lang, konu })));
}

const konuPath = (lang, id) => `${spPath(lang)}/${id}`;
const urlFor = (lang, id) => SP_BASE + konuPath(lang, id);

export async function generateMetadata({ params }) {
  const { lang, konu } = await params;
  const k = konuMetni(lang, konu);
  if (!SP_LANGS.includes(lang) || !k) return {};
  const languages = Object.fromEntries(SP_LANGS.map((l) => [l, urlFor(l, konu)]));
  languages["x-default"] = urlFor("tr", konu);
  return {
    title: { absolute: fitTitle(k.title) },
    description: k.desc,
    alternates: { canonical: urlFor(lang, konu), languages },
    openGraph: { title: fitTitle(k.title), description: k.desc, url: urlFor(lang, konu), type: "website", locale: OG_LOCALE?.[lang], siteName: SP_BRAND, images: [{ url: SP_BASE + IMAGES[konuBul(konu)?.foto ?? HERO_INDEX], width: IMG_W, height: IMG_H }] },
  };
}

export default async function KonuSayfasi({ params }) {
  const { lang, konu } = await params;
  const meta = konuBul(konu);
  const k = konuMetni(lang, konu);
  if (!SP_LANGS.includes(lang) || !meta || !k) notFound();
  const c = COPY[lang];
  const x = EXTRA[lang];
  const ui = KUI[lang];
  const url = urlFor(lang, konu);
  const wa = spWhatsapp(k.wa);
  const urun = meta.tur === "urun";
  const digerler = KONULAR.filter((t) => t.id !== konu);

  const provider = spBusiness(lang);
  const areaServed = urun ? { "@type": "City", name: SP_CITY } : meta.yer.map((y) => ({ "@type": "Place", name: `${y}, ${SP_CITY}` }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: k.h1,
      serviceType: k.kisa,
      description: k.desc,
      inLanguage: lang,
      url,
      areaServed,
      provider,
      ...(typeof meta.foto === "number" ? { image: SP_BASE + IMAGES[meta.foto] } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: [{ q: k.answerH, a: k.answer }, ...k.faq].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SP_BRAND, item: SP_BASE + spPath(lang) },
        { "@type": "ListItem", position: 2, name: k.kisa, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name: fitTitle(k.title),
      inLanguage: lang,
      isPartOf: { "@type": "WebSite", name: SP_BRAND, url: SP_BASE + spPath(lang) },
      about: { "@id": SP_BASE + "/#likya-home" },
      ...(lastMod(url) ? { dateModified: lastMod(url) } : {}),
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".sp-answer"] },
    },
  ];

  const Ticks = ({ items }) => (
    <ul className="mt-3">
      {items.map((t) => (
        <li key={t} className="relative py-2 border-b border-white/10 text-slate-300 ps-7">
          <span className="absolute start-0 text-[#00f260] font-black">✓</span>
          {t}
        </li>
      ))}
    </ul>
  );

  const KonuLinkleri = ({ tur, baslik }) => (
    <div className="mb-6">
      <h3 className="font-bold text-white mb-2">{baslik}</h3>
      <ul className="flex flex-wrap gap-2">
        {digerler.filter((t) => t.tur === tur).map((t) => (
          <li key={t.id}>
            <Link href={konuPath(lang, t.id)} className="inline-block px-3 py-2 rounded-xl border border-white/15 text-sm text-slate-200 hover:border-[#00f260] hover:text-white">
              {konuMetni(lang, t.id).kisa}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} lang={lang} className="min-h-screen bg-[#030712] text-slate-200 pt-28 pb-28 px-4 md:px-8">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          <Link href={spPath(lang)} aria-label={`${SP_BRAND} — ${x.tagline}`}>
            <LikyaLogo size={38} />
          </Link>
          <nav aria-label="Languages" className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm">
            {SP_LANGS.map((l) => (
              <Link key={l} href={konuPath(l, konu)} hrefLang={l} lang={l} className={l === lang ? "text-[#00f260] font-bold" : "text-slate-400 hover:text-white"}>
                {COPY[l].label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-4">
          <Link href={spPath(lang)} className="hover:text-white">{SP_BRAND}</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-300">{k.kisa}</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_220px] gap-6 items-center mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#d9a441] mb-2">{SP_BRAND} · {urun ? ui.urunler : ui.bolgeler}</p>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-4">{k.h1}</h1>
            <p className="text-lg text-slate-300">{k.lead}</p>
          </div>
          {meta.cizim && (
            <figure className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]">
              <SpIllustration kind={meta.cizim} label={k.kisa} />
            </figure>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-[#1fa855] text-white font-bold">{c.wa}</a>
          <a href={`tel:${SP_PHONE_TEL}`} className="px-5 py-3 rounded-xl border border-white/20 text-white font-bold">
            {c.call}: <bdi>{SP_PHONE_DISPLAY}</bdi>
          </a>
        </div>

        <section className="border border-white/10 border-s-4 border-s-[#00f260] rounded-2xl p-5 bg-white/[0.03] mb-10">
          <h2 className="text-xl font-bold text-white mb-2">{k.answerH}</h2>
          <p className="sp-answer text-slate-200 leading-relaxed">{k.answer}</p>
        </section>

        {typeof meta.foto === "number" && (
          <figure className="mb-10 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03]">
            <Image src={IMAGES[meta.foto]} alt={x.imgs[meta.foto]} width={IMG_W} height={IMG_H} sizes="(max-width: 768px) 100vw, 768px" className="w-full h-auto" />
            <figcaption className="px-4 py-3 text-sm text-slate-300">
              {x.imgs[meta.foto]} <span className="text-slate-500">· {x.note}</span>
            </figcaption>
          </figure>
        )}

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-1">{urun ? ui.noktaUrun : ui.noktaBolge}</h2>
          <Ticks items={k.nokta} />
        </section>

        {!urun && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">{ui.yerler}</h2>
            <p className="flex flex-wrap gap-2">
              {meta.yer.map((y) => (
                <span key={y} className="px-3 py-1 rounded-full border border-white/15 text-sm text-slate-300">{y}</span>
              ))}
            </p>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">{c.stepsH}</h2>
          <ol className="space-y-3">
            {c.steps.map((s, i) => (
              <li key={s.t} className="relative border border-white/10 rounded-2xl p-4 ps-14 bg-white/[0.03]">
                <span className="absolute start-4 top-4 w-7 h-7 rounded-full bg-[#00f260] text-black font-black text-sm grid place-items-center">{i + 1}</span>
                <strong className="block text-white">{s.t}</strong>
                <span className="text-slate-300 text-sm">{s.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-1">{c.sendH}</h2>
          <Ticks items={c.send} />
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">{ui.sss}</h2>
          {k.faq.map((f) => (
            <details key={f.q} className="border border-white/10 rounded-xl p-4 mb-2 bg-white/[0.03]">
              <summary className="cursor-pointer font-bold text-white">{f.q}</summary>
              <p className="mt-2 text-slate-300">{f.a}</p>
            </details>
          ))}
        </section>

        <section className="border border-[#00f260]/40 rounded-2xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{c.ctaH}</h2>
          <p className="text-slate-300 mb-4">{c.ctaText}</p>
          <div className="flex flex-wrap gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-[#1fa855] text-white font-bold">{c.wa}</a>
            <a href={`tel:${SP_PHONE_TEL}`} className="px-5 py-3 rounded-xl border border-white/20 text-white font-bold"><bdi>{SP_PHONE_DISPLAY}</bdi></a>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4">{ui.diger}</h2>
          <KonuLinkleri tur="urun" baslik={ui.urunler} />
          <KonuLinkleri tur="bolge" baslik={ui.bolgeler} />
          <Link href={spPath(lang)} className="text-[#00f260] hover:underline text-sm">← {ui.ana}: {SP_BRAND}</Link>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2">{c.langsH}</h2>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {SP_LANGS.filter((l) => l !== lang).map((l) => (
              <Link key={l} href={konuPath(l, konu)} hrefLang={l} lang={l} className="text-[#00f260] hover:underline">{COPY[l].label}</Link>
            ))}
          </p>
        </section>
      </article>

      <footer className="max-w-3xl mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-slate-500">
        © {new Date().getFullYear()} {SP_BRAND} · {SP_CITY} · <bdi>{SP_PHONE_DISPLAY}</bdi>
      </footer>

      <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={c.wa} className="fixed bottom-4 end-4 z-50 px-4 py-3 rounded-full bg-[#1fa855] text-white font-black shadow-lg">WhatsApp</a>
    </div>
  );
}
