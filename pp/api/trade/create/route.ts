// app/api/trade/create/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trade from "@/models/Trade";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const trade = await Trade.create({
      initiator: body.initiator,
      receiver: body.receiver,
      offeredProduct: body.offeredProduct,
      requestedProduct: body.requestedProduct,
      escrowAmount: body.escrowAmount || 0,
    });

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
