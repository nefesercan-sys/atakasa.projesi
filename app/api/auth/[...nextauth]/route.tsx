import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Veritabanı Bağlantısı
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  // TypeScript hatasını önlemek için 'as string' garantisi eklendi
  await mongoose.connect(process.env.MONGODB_URI as string);
};

// Kullanıcı Şeması (Atakasa Özel)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const handler = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Siber Giris",
      // HATA BURADAYDI: credentials tanımlaması eklendi
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Lütfen tüm alanları doldurun");
        }

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Kullanıcı bulunamadı");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Şifre hatalı");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
