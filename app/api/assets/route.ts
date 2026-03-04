import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Asset from '@/models/Asset';

// Tüm varlıkları (ürünleri) veritabanından çekmek için (GET)
export async function GET() {
  try {
    await connectDB();
    const assets = await Asset.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Veriler getirilemedi' }, { status: 500 });
  }
}

// Yeni bir varlık (ürün) eklemek için (POST)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newAsset = await Asset.create(body);
    return NextResponse.json({ success: true, data: newAsset }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Varlık eklenemedi' }, { status: 400 });
  }
}
