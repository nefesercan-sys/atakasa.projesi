import mongoose from 'mongoose';
// Vercel çökmesini önleyen göreceli yol
import Order from '../../../../models/Order';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
  } catch (err) {
    console.error("Veritabanı bağlantı hatası:", err);
  }
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    // URL'den siparişin kimliğini (ID) alıyoruz
    const { id } = params;
    
    // Panelden gönderilen yeni durumu ve kargo numarasını alıyoruz
    const body = await req.json();
    const { status, trackingNumber } = body;

    // Siparişi bul ve yeni bilgilerle anında güncelle
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        ...(status && { status }), 
        ...(trackingNumber && { trackingNumber }) 
      },
      { new: true } // Güncellenmiş veriyi geri döndür
    );

    if (!updatedOrder) {
      return Response.json({ error: "Sipariş siber ağda bulunamadı." }, { status: 404 });
    }

    return Response.json({ 
      message: "Sipariş durumu başarıyla güncellendi. ⚡", 
      order: updatedOrder 
    }, { status: 200 });

  } catch (error) {
    console.error("Sipariş güncelleme hatası:", error);
    return Response.json({ error: "Sistem çakışması yaşandı." }, { status: 500 });
  }
}
