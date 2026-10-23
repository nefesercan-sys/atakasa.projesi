import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import { hizSiniri } from "@/lib/ratelimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/giris" },
  providers: [
    CredentialsProvider({
      name: "E-posta",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").trim().toLowerCase();
        const sifre = credentials?.password || "";
        if (!email || !sifre) return null;
        // Aynı e-postaya art arda deneme: dakikada en fazla 8
        if (!hizSiniri(`giris:${email}`, 8, 60_000)) return null;

        await connectMongoDB();
        const user = await User.findOne({ email }).select("+password").lean<{ _id: unknown; email: string; name: string; password?: string }>();
        if (!user || !user.password) return null;
        const dogru = await bcrypt.compare(sifre, user.password);
        if (!dogru) return null;
        return { id: String(user._id), email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) (session.user as { id?: string }).id = token.sub;
      return session;
    },
  },
};
