import HomeClient from "@/components/HomeClient";
import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";

export default async function Home() {
  try {
    await connectMongoDB();

    const ilanlar = await Varlik.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .select("baslik fiyat eskiFiyat kategori sehir resimler aciklama takasIstegi satici createdAt")
      .lean();

    const borsaVeriliIlanlar = ilanlar.map((ilan: any) => {
      let degisimYuzdesi = 0;
      if (ilan.eskiFiyat > 0 && ilan.fiyat !== ilan.eskiFiyat) {
        degisimYuzdesi = ((ilan.fiyat - ilan.eskiFiyat) / ilan.eskiFiyat) * 100;
      }
      return {
        ...ilan,
        _id: ilan._id.toString(),
        degisimYuzdesi: Number(degisimYuzdesi.toFixed(1)),
        borsaDurumu: degisimYuzdesi < 0 ? "DÜŞÜŞ" : degisimYuzdesi > 0 ? "YÜKSELİŞ" : "STABİL",
      };
    });

    return <HomeClient initialIlanlar={borsaVeriliIlanlar} />;
  } catch {
    return <HomeClient initialIlanlar={[]} />;
  }
}
