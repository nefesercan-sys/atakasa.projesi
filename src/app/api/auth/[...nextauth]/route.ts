import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// 🚨 VERİTABANI BAĞLANTISI
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 🧬 KULLANICI ŞEMASI
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" }, // user veya admin
  balance: { type: Number, default: 0 }    // Atakasa Siber Cüzdan
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Siber Giriş",
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user._id, name: user.name, email: user.email, role: user.role };
        }
        throw new Error("Siber Kimlik Reddedildi: Geçersiz Bilgiler!");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.role = user.role; return token; },
    async session({ session, token }) { if (token) session.user.role = token.role; return session; },
  },
  pages: { signIn: "/giris" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
