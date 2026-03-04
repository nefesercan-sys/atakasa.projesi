import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Trade from "@/models/Trade"

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()
  const trade = await Trade.create(body)
  return NextResponse.json(trade)
}

export async function GET() {
  await connectDB()
  const trades = await Trade.find()
    .populate("initiator")
    .populate("receiver")
    .populate("offeredProduct")
    .populate("requestedProduct")

  return NextResponse.json(trades)
}
