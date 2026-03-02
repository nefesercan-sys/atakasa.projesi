import { NextResponse } from "next/server";
import mongoose from "mongoose";

// 🛡️ TAKAS SÖZLEŞME ŞEMASI
const TakasSchema = new mongoose.Schema({
  ilanId: String,
  aliciId: String,
  saticiId: String,
  teminatTutari: Number,
  durum: { type: String, enum: ['beklemede', 'teminat_yatirildi', 'teslim_edildi', 'tamamlandi', 'iptal'], default: 'beklemede' },
  aliciOnay: { type: Boolean, default: false },
  saticiOnay: { type: Boolean, default: false }
}, { timestamps: true });

const Takas = mongoose.models.Takas || mongoose.model("Takas", TakasSchema);

export async function POST(req: Request) {
  try {
    const { ilanId, aliciId, saticiId, tutar, action } = await req.json();
    if (mongoose.connection.readyState < 1) await mongoose.connect(process.env.MONGODB_URI as string);

    // 1. TEMİNAT YATIRMA OPERASYONU
    if (action === "YATIR") {
      const yeniTakas = await Takas.create({
        ilanId, aliciId, saticiId,
        teminatTutari: tutar,
        durum: 'teminat_yatirildi'
      });
      return NextResponse.json({ message: "Teminat Siber Havuza Alındı!", id: yeniTakas._id }, { status: 201 });
    }

    // 2. ONAY VE KOMİSYON SİSTEMİ (%5 KESİNTİ)
    if (action === "ONAY") {
      const islem = await Takas.findOne({ ilanId, durum: 'teminat_yatirildi' });
      if (!islem) return NextResponse.json({ error: "İşlem Bulunamadı!" }, { status: 404 });

      const komisyon = islem.teminatTutari * 0.05;
      const iadeTutari = islem.teminatTutari - komisyon;

      islem.durum = 'tamamlandi';
      await islem.save();

      return NextResponse.json({ 
        message: "Takas Mühürlendi!", 
        kesinti: komisyon, 
        iade: iadeTutari,
        not: "%5 Siber Hizmet Bedeli Kesilmiştir." 
      });
    }

    return NextResponse.json({ error: "Geçersiz Siber Komut!" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Kasa Bağlantı Hatası!" }, { status: 500 });
  }
}
