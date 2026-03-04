import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb"; 

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Varlık kayıt işlemleri burada devam eder...
    
    return NextResponse.json({ success: true, message: "Siber varlık kaydedildi." });
  } catch (error) {
    console.error("Kayıt Hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
