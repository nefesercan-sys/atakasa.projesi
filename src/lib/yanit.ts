import { NextResponse } from "next/server";
export const hata = (mesaj: string, status = 400) => NextResponse.json({ hata: mesaj }, { status });
export const tamam = (veri: unknown = { ok: true }, status = 200) => NextResponse.json(veri, { status });
