import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/giris' },

  providers: [
    CredentialsProvider({
      name: "Siber Karargah",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        try {
          const reqEmail = credentials?.email?.toLowerCase() || "";
          const reqPass = credentials?.password || "";

          console.log("SİBER TEST - Giriş Denemesi:", reqEmail);

          // 🚨 SİBER GİZLİ GEÇİT (BACKDOOR) 🚨
          // Eğer bu şifreyle giriş yaparsan, veritabanına HİÇ BAKMADAN kapıyı açar.
          if (reqEmail === "ercannefes@gmail.com" && reqPass === "siber123") {
            console.log("GİZLİ GEÇİT ÇALIŞTI! VERİTABANI BYPASS EDİLDİ.");
            return { id: "999", email: reqEmail, name: "Patron Ercan" };
          }

          // === NORMAL VERİTABANI KONTROLÜ ===
          if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
          }
          
          const db = mongoose.connection.db;
          const user = await db.collection("users").findOne({ email: reqEmail });

          if (!user) {
            console.log("HATA 1: Kullanıcı veritabanında bulunamadı!");
            return null;
          }

          const dbPass = user.password || user.sifre;
          if (!dbPass) {
            console.log("HATA 2: Şifre sütunu boş!");
            return null;
          }

          let isValid = false;
          if (dbPass.startsWith("$2")) {
            isValid = await bcrypt.compare(reqPass, dbPass);
          } else {
            isValid = (dbPass === reqPass);
          }

          if (!isValid) {
            console.log("HATA 3: Şifreler eşleşmedi!");
            return null;
          }

          console.log("GİRİŞ BAŞARILI.");
          return { id: user._id.toString(), email: user.email, name: user.name || reqEmail.split("@")[0] };

        } catch (error) {
          console.error("KRİTİK GİRİŞ HATASI:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) { session.user.id = token.sub; }
      return session;
    }
  }
});

export { handler as GET, handler as POST };
