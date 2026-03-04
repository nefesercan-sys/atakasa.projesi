import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Trade from "@/models/Trade";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { initiator, receiver, offeredProduct, requestedProduct } = body;

    if (!initiator || !receiver || !offeredProduct || !requestedProduct) {
      return NextResponse.json(
        { success: false, message: "Eksik alan var" },
        { status: 400 }
      );
    }

    const trade = await Trade.create({
      initiator,
      receiver,
      offeredProduct,
      requestedProduct,
    });

    return NextResponse.json({ success: true, trade });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
