import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export type Oturum = { id: string; email: string; name: string; admin: boolean };

export async function oturumAl(): Promise<Oturum | null> {
  const s = await getServerSession(authOptions);
  const u = s?.user as { id?: string; email?: string | null; name?: string | null } | undefined;
  if (!u?.id || !u.email) return null;
  const admins = (process.env.ADMIN_EMAILS || "").toLowerCase().split(",").map((x) => x.trim()).filter(Boolean);
  return { id: u.id, email: u.email.toLowerCase(), name: u.name || "", admin: admins.includes(u.email.toLowerCase()) };
}
