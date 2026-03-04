import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trade from "@/models/Trade";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { tradeId } = await req.json();

    const trade = await Trade.findByIdAndUpdate(
      tradeId,
      { status: "accepted" },
      { new: true }
    );

    return NextResponse.json({ success: true, trade });
  } catch (error) {
    return NextResponse.json({ success: false, error });
  }
}
