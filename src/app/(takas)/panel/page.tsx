import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import "@/models/User";
import { oturumAl } from "@/lib/oturum";
import { iletisimAcik, type TeklifDurum } from "@/lib/teklif-akis";
import PanelClient, { type PanelTeklif } from "@/components/PanelClient";

export const metadata: Metadata = { title: "Panelim", robots: { index: false } };
export const dynamic = "force-dynamic";

type Kisi = { _id: unknown; name?: string; telefon?: string; email?: string };

export default async function Page() {
  headers();
  const o = await oturumAl();
  if (!o) redirect("/giris");
  await connectMongoDB();

  const [ilanlar, ham] = await Promise.all([
    Varlik.find({ satici: o.id, durum: { $ne: "silindi" } }).sort({ createdAt: -1 }).select("baslik slug durum resimler teklifSayisi").lean(),
    Teklif.find({ $or: [{ gonderen: o.id }, { alici: o.id }] }).sort({ updatedAt: -1 }).limit(200)
      .populate("hedefIlan", "baslik slug resimler").populate("teklifIlan", "baslik slug resimler")
      .populate("gonderen", "name telefon email").populate("alici", "name telefon email").lean(),
  ]);

  const teklifler: PanelTeklif[] = ham.map((t) => {
    const benG = String((t.gonderen as unknown as Kisi)._id) === o.id;
    const k = (benG ? t.alici : t.gonderen) as unknown as Kisi;
    const acik = iletisimAcik(t.durum as TeklifDurum);
    return {
      id: String(t._id), yon: benG ? "gonderilen" : "gelen", durum: t.durum, mesaj: t.mesaj || "",
      benOnayladim: benG ? t.gonderenOnay : t.aliciOnay, karsiOnayladi: benG ? t.aliciOnay : t.gonderenOnay,
      hedefIlan: t.hedefIlan as never, teklifIlan: t.teklifIlan as never,
      karsiTaraf: { ad: k?.name || "Üye", telefon: acik ? k?.telefon || "" : undefined, email: acik ? k?.email : undefined },
    };
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Merhaba {o.name.split(" ")[0]} 👋</h1>
      <PanelClient ilanlar={JSON.parse(JSON.stringify(ilanlar))} teklifler={JSON.parse(JSON.stringify(teklifler))} />
    </div>
  );
}
