import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import Varlik from "@/models/Varlik";
import Teklif from "@/models/Teklif";
import { tamam } from "@/lib/yanit";

export const revalidate = 300;

export async function GET() {
  await connectMongoDB();
  const [uye, ilan, takas] = await Promise.all([
    User.countDocuments(),
    Varlik.countDocuments({ durum: "aktif" }),
    Teklif.countDocuments({ durum: "tamamlandi" }),
  ]);
  return tamam({ uye, ilan, takas });
}
