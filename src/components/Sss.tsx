import JsonLd from "./JsonLd";

export type SssOge = { s: string; c: string };

/** Görünen SSS + aynı metinle FAQPage şeması (görünmeyen içerik şemaya konmaz). */
export default function Sss({ baslik = "Sık sorulan sorular", oge }: { baslik?: string; oge: SssOge[] }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold">{baslik}</h2>
      {oge.map((o) => (
        <details key={o.s} className="kart p-4">
          <summary className="cursor-pointer font-semibold">{o.s}</summary>
          <p className="mt-2 text-gray-700">{o.c}</p>
        </details>
      ))}
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: oge.map((o) => ({ "@type": "Question", name: o.s, acceptedAnswer: { "@type": "Answer", text: o.c } })) }} />
    </section>
  );
}
