import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trade from "@/models/Trade";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { tradeId } = await req.json();

    if (!tradeId) {
      return NextResponse.json(
        { success: false, message: "tradeId gerekli" },
        { status: 400 }
      );
    }

    const trade = await Trade.findByIdAndUpdate(
      tradeId,
      { status: "accepted" },
      { new: true }
    );

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
