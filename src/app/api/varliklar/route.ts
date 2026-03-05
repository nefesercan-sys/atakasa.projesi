import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

export async function GET() {
  try {
    await connectMongoDB();
    // En son eklenen ilan en üstte görünecek şekilde tüm varlıkları çek
    const ilanlar = await Varlik.find().sort({ createdAt: -1 });
    
    return NextResponse.json(ilanlar, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Veri akışı sağlanamadı." }, { status: 500 });
  }
}
