export const dynamic = 'force-dynamic'; // 🚀 BUZUL KIRICI: Her seferinde taze veri çeker

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import Varlik from "../../../models/Varlik";

export async function GET() {
  try {
    await connectMongoDB();
    const ilanlar = await Varlik.find().sort({ createdAt: -1 });
    return NextResponse.json(ilanlar, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Siber veri hatası." }, { status: 500 });
  }
}
