import { connectMongoDB } from "@/lib/mongodb";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import { tamam } from "@/lib/yanit";

export const revalidate = 300;

export async function GET() {
  await connectMongoDB();
  const [ilan, takas] = await Promise.all([
    Varlik.countDocuments({ durum: "aktif" }),
    Teklif.countDocuments({ durum: "tamamlandi" }),
  ]);
  return tamam({ ilan, takas });
}
