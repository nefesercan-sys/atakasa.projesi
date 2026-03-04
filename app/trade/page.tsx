// app/trade/page.tsx

import dbConnect from "@/lib/dbConnect";
import Trade from "@/models/Trade";

export default async function TradePage() {
  await dbConnect();

  const trades = await Trade.find().populate("initiator receiver");

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Takaslar</h1>

      {trades.map((trade: any) => (
        <div
          key={trade._id}
          className="border p-4 mb-4 rounded-lg shadow"
        >
          <p>Başlatan: {trade.initiator?.name}</p>
          <p>Alıcı: {trade.receiver?.name}</p>
          <p>Durum: {trade.status}</p>
        </div>
      ))}
    </div>
  );
}
