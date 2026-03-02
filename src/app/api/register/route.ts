import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (mongoose.connection.readyState < 1) {
        await mongoose.connect(process.env.MONGODB_URI as string);
    }
    
    const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
      name: String, email: { type: String, unique: true }, password: { type: String }, role: { type: String, default: "user" }
    }));

    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ error: "Bu siber kimlik zaten kayıtlı!" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "Siber Kayıt Başarılı!", user: newUser }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Sistem Hatası!" }, { status: 500 });
  }
}
