// NextAuth ayarları. Sabit/gizli giriş YOK; düz metin şifre kabul EDİLMEZ (yalnızca bcrypt).
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/giris" },
  providers: [
    CredentialsProvider({
      name: "E-posta",
      credentials: { email: { label: "E-posta", type: "email" }, password: { label: "Şifre", type: "password" } },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const pass = credentials?.password || "";
        if (!email || !pass) return null;
        await connectMongoDB();
        const user = await User.findOne({ email });
        const hash: string | undefined = user?.password;
        // Düz metin şifre (eski kayıtlar) artık geçersiz: kullanıcı "şifremi unuttum" ile yenilemeli.
        if (!user || !hash || !hash.startsWith("$2")) return null;
        if (!(await bcrypt.compare(pass, hash))) return null;
        return { id: String(user._id), email: user.email, name: user.name || email.split("@")[0] };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) token.sub = (user as { id: string }).id; return token; },
    async session({ session, token }) {
      if (session.user && token.sub) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
};
