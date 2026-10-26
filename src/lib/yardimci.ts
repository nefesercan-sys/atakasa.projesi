import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const hata = (mesaj: string, status = 400) => NextResponse.json({ error: mesaj }, { status });
export const tamam = (veri: unknown, status = 200) => NextResponse.json(veri, { status });
export const idGecerli = (id: unknown): id is string => typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
export const temizMetin = (v: unknown, max: number): string => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "");
export const regexKacis = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function slugla(text: string): string {
  return text.toString().toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c").replace(/İ/g, "i")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "ilan";
}
/** Bir ilan "takas edilebilir" mi? (eski kayıtlarda durum/aktif alanı olmayabilir → aktif sayılır) */
export const ilanMusait = (v: { aktif?: boolean; durum?: string } | null | undefined): boolean =>
  !!v && v.aktif !== false && (v.durum === undefined || v.durum === "aktif");
export const MUSAIT_FILTRE = { aktif: { $ne: false }, durum: { $nin: ["takasta", "takasEdildi"] } };
