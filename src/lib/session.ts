import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export interface Kullanici { id: string; email: string; name: string }

/** Giriş yapmış kullanıcıyı döndürür; yoksa null. Tüm yazma uçları bunu kullanır. */
export async function oturumKullanici(): Promise<Kullanici | null> {
  const s = await getServerSession(authOptions);
  const u = s?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!u?.id || !u.email) return null;
  return { id: u.id, email: u.email.toLowerCase(), name: u.name || u.email.split("@")[0] };
}
