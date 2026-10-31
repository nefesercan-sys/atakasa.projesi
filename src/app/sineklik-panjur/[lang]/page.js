import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LikyaLogo from "@/components/sineklik/LikyaLogo";
import SpIllustration from "@/components/sineklik/SpIllustration";
import { spIsRtl as isRtl, SP_OG_LOCALE as OG_LOCALE } from "@/lib/sineklik-panjur";
import { IMAGES, IMG_W, IMG_H, HERO_INDEX, EXTRA } from "@/lib/likya-home";
import { BELGELER } from "@/lib/likya-belgeler";
import { COPY, SP_LANGS, SP_BASE, SP_BRAND, SP_CITY, SP_PHONE_DISPLAY, SP_PHONE_TEL, spPath, spWhatsapp } from "@/lib/sineklik-panjur";

export const dynamicParams = false;

export function generateStaticParams() {
  return SP_LANGS.map((lang) => ({ lang }));
}

const urlFor = (lang) => SP_BASE + spPath(lang);

export function generateMetadata({ params }) {
  const lang = params.lang;
  if (!SP_LANGS.includes(lang)) return {};
  const c = COPY[lang];
  const languages = Object.fromEntries(SP_LANGS.map((l) => [l, urlFor(l)]));
  languages["x-default"] = urlFor("tr");
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDesc,
    keywords: c.keywords,
    alternates: { canonical: urlFor(lang), languages },
    openGraph: { title: c.metaTitle, description: c.metaDesc, url: urlFor(lang), type: "website", locale: OG_LOCALE?.[lang], siteName: SP_BRAND, images: [{ url: SP_BASE + IMAGES[HERO_INDEX], width: IMG_W, height: IMG_H }] },
  };
}

export default function SineklikPanjur({ params }) {
  const lang = params.lang;
  if (!SP_LANGS.includes(lang)) notFound();
  const c = COPY[lang];
  const x = EXTRA[lang];
  const url = urlFor(lang);
  const wa = spWhatsapp(c.waMsg);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: c.serviceName,
      serviceType: `${c.sinekH} / ${c.panjurH}`,
      description: c.metaDesc,
      inLanguage: lang,
      url,
      areaServed: { "@type": "City", name: SP_CITY },
      provider: { "@type": "Organization", name: SP_BRAND, slogan: x.tagline, telephone: SP_PHONE_TEL, url: SP_BASE, logo: SP_BASE + "/likya-home/logo.svg" },
      image: IMAGES.map((i) => SP_BASE + i),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: c.home, item: SP_BASE },
        { "@type": "ListItem", position: 2, name: c.h1, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name: c.metaTitle,
      speakable: { "@type": "SpeakableSpecification", cssSelector: [".sp-answer"] },
    },
  ];

  const gallery = [
    { kind: "sabit", cap: c.sinek[0].t, alt: c.alt[0] },
    { kind: "surme", cap: c.sinek[2].t, alt: c.alt[1] },
    { kind: "plise", cap: c.sinek[3].t, alt: c.alt[2] },
    { kind: "rulo", cap: c.sinek[4].t, alt: c.alt[3] },
    { kind: "panjur", cap: c.panjurH, alt: c.alt[4] },
  ];

  const Cards = ({ items }) => (
    <div className="grid sm:grid-cols-2 gap-3 mt-4">
      {items.map((i) => (
        <article key={i.t} className="border border-white/10 rounded-2xl p-4 bg-white/[0.03]">
          <h3 className="font-bold text-white mb-1">{i.t}</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{i.d}</p>
        </article>
      ))}
    </div>
  );

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

  return (
    <div dir={isRtl(lang) ? "rtl" : "ltr"} className="fixed inset-0 z-[100] overflow-y-auto bg-[#030712] text-slate-200 pt-28 pb-28 px-4 md:px-8">
      <header className="fixed top-0 inset-x-0 z-50 bg-[#030712]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4 flex-wrap">
          <Link href={spPath(lang)} aria-label={`${SP_BRAND} — ${x.tagline}`}>
            <LikyaLogo size={38} />
          </Link>
          <nav aria-label="Languages" className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm">
            {SP_LANGS.map((l) => (
              <Link key={l} href={spPath(l)} hrefLang={l} lang={l} className={l === lang ? "text-[#00f260] font-bold" : "text-slate-400 hover:text-white"}>
                {COPY[l].label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-3xl mx-auto">
        <p className="text-sm mb-6">
          <Link href="/" className="text-[#00f260] hover:underline">{c.home}</Link>
        </p>

        <div className="relative rounded-3xl overflow-hidden mb-10 border border-white/10">
          <Image src={IMAGES[HERO_INDEX]} alt={x.imgs[HERO_INDEX]} width={IMG_W} height={IMG_H} priority sizes="(max-width: 768px) 100vw, 768px" className="w-full h-72 md:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[#d9a441] mb-2">{SP_BRAND} · {c.eyebrow}</p>
            <h1 className="text-2xl md:text-4xl font-black text-white">{c.h1}</h1>
          </div>
        </div>
        <p className="text-lg text-slate-300 mb-6">{c.lead}</p>
        <div className="flex flex-wrap gap-3 mb-10">
          <a href={wa} rel="noopener" className="px-5 py-3 rounded-xl bg-[#1fa855] text-white font-bold">{c.wa}</a>
          <a href={`tel:${SP_PHONE_TEL}`} className="px-5 py-3 rounded-xl border border-white/20 text-white font-bold">
            {c.call}: <bdi>{SP_PHONE_DISPLAY}</bdi>
          </a>
        </div>

        <section className="border border-white/10 border-s-4 border-s-[#00f260] rounded-2xl p-5 bg-white/[0.03] mb-10">
          <h2 className="text-xl font-bold text-white mb-2">{c.answerH}</h2>
          <p className="sp-answer text-slate-200 leading-relaxed">{c.answer}</p>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10" aria-label={`${c.sinekH} / ${c.panjurH}`}>
          {gallery.map((g) => (
            <figure key={g.kind} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]">
              <SpIllustration kind={g.kind} label={g.alt} />
              <figcaption className="p-2 text-xs font-semibold text-center text-slate-300">{g.cap}</figcaption>
            </figure>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">{c.sinekH}</h2>
          <p className="text-slate-300 leading-relaxed">{c.sinekIntro}</p>
          <Cards items={c.sinek} />
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">{c.panjurH}</h2>
          <p className="text-slate-300 leading-relaxed">{c.panjurIntro}</p>
          <Cards items={c.panjur} />
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-1">{c.chooseH}</h2>
          <Ticks items={c.choose} />
        </section>

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
          <h2 className="text-2xl font-bold text-white mb-3">{x.galleryH}</h2>
          <div className="grid grid-cols-2 gap-3">
            {IMAGES.map((src, i) => (
              <figure key={src} className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.03]">
                <Image src={src} alt={x.imgs[i]} width={IMG_W} height={IMG_H} sizes="(max-width: 768px) 50vw, 380px" className="w-full h-auto" loading="lazy" />
                <figcaption className="p-2 text-xs text-slate-300">{x.imgs[i]}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">{x.note}</p>
        </section>

        <section className="mb-10 border border-white/10 rounded-2xl p-5 bg-white/[0.03]">
          <h2 className="text-2xl font-bold text-white mb-2">{x.projectsH}</h2>
          <p className="text-slate-300 leading-relaxed">{x.projectsText}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{x.certH}</h2>
          <p className="text-slate-300">{x.certIntro}</p>
          <Ticks items={x.certTips} />
          {BELGELER.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold text-white mb-2">{x.docsH}</h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {BELGELER.map((b) => (
                  <li key={b.name} className="border border-white/10 rounded-xl p-4 bg-white/[0.03] text-sm">
                    <strong className="block text-white">{b.name}</strong>
                    <span className="text-slate-300">{b.issuer}</span>
                    {b.number && <span className="block text-slate-400">№ <bdi>{b.number}</bdi></span>}
                    {b.valid && <span className="block text-slate-400"><bdi>{b.valid}</bdi></span>}
                    {b.url && <a href={b.url} rel="noopener" className="text-[#00f260] underline">PDF</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-3">{c.faqH}</h2>
          {c.faq.map((f) => (
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
            <a href={wa} rel="noopener" className="px-5 py-3 rounded-xl bg-[#1fa855] text-white font-bold">{c.wa}</a>
            <a href={`tel:${SP_PHONE_TEL}`} className="px-5 py-3 rounded-xl border border-white/20 text-white font-bold"><bdi>{SP_PHONE_DISPLAY}</bdi></a>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-white mb-2">{c.langsH}</h2>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {SP_LANGS.filter((l) => l !== lang).map((l) => (
              <Link key={l} href={spPath(l)} hrefLang={l} lang={l} className="text-[#00f260] hover:underline">{COPY[l].label}</Link>
            ))}
          </p>
        </section>
      </article>

      <footer className="max-w-3xl mx-auto mt-10 pt-6 border-t border-white/10 text-xs text-slate-500">
        © {new Date().getFullYear()} {SP_BRAND} · {SP_CITY} · <bdi>{SP_PHONE_DISPLAY}</bdi>
      </footer>

      <a href={wa} rel="noopener" aria-label={c.wa} className="fixed bottom-4 end-4 z-50 px-4 py-3 rounded-full bg-[#1fa855] text-white font-black shadow-lg">WhatsApp</a>
    </div>
  );
}
