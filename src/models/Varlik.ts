import mongoose, { Schema, models } from "mongoose";

const varlikSchema = new Schema(
  {
    baslik: { type: String, required: true },
    fiyat: { type: Number, required: true },
    
    // 📉 BORSA HAFIZASI (Fiyat Geçmişi Analizi İçin)
    eskiFiyat: { type: Number, default: 0 }, 
    fiyatGuncellemeTarihi: { type: Date, default: Date.now },
    
    kategori: { type: String, required: true },
    ulke: { type: String, required: true },
    sehir: { type: String, required: true },
    ilce: { type: String, required: true },
    aciklama: { type: String },
    takasIstegi: { type: String },
    resimler: [{ type: String }], // Görsel linklerini tutacak dizi
    satici: { type: Schema.Types.ObjectId, ref: "User", required: true },
    aktif: { type: Boolean, default: true },

    // 📊 SİBER ANALİZ METRİKLERİ (Filtreleme ve "En"ler Listesi İçin)
    goruntulenmeSayisi: { type: Number, default: 0 }, // En çok incelenenler
    takasTeklifiSayisi: { type: Number, default: 0 }, // En çok takas edilenler
    begeniSayisi: { type: Number, default: 0 },       // En çok beğenilenler
  },
  { 
    timestamps: true // Oluşturulma ve güncelleme tarihlerini otomatik tutar
  }
);

const Varlik = models.Varlik || mongoose.model("Varlik", varlikSchema);
export default Varlik;
