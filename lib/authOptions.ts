// lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// ⚠️ Bu dosya zaten projenizde varsa bu şablonu KULLANMA
// Sadece "Module not found: Can't resolve '@/lib/authOptions'" hatası alıyorsan ekle

export const authOptions: NextAuthOptions = {
  providers: [
    // Mevcut provider'larını buraya taşı
    // Örnek:
    // CredentialsProvider({ ... })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/giris",
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
