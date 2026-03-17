// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

// Kullanıcı modelini import et — projenizde nasıl tanımlıysa ona göre değiştirin
// import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();

          // ⚠️ BURAYA KENDİ KULLANICI SORGUNUZU YAZIN
          // Mevcut projenizde nasıl kullanıcı çekiyorsanız aynısını kullanın
          // Örnek:
          // const user = await User.findOne({ email: credentials.email });
          // if (!user) return null;
          // const isValid = await bcrypt.compare(credentials.password, user.password);
          // if (!isValid) return null;
          // return { id: user._id.toString(), email: user.email, name: user.name };

          return null; // ← Kendi kodunuzla değiştirin
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
