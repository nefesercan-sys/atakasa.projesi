import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "optional",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-playfair",
  display: "optional",
  preload: true,
});

export const metadata: Metadata = {
  title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
  description: "Türkiye'nin en güvenli takas ve barter platformu. Elektronik, emlak, araç ve daha fazlasını takas edin.",
  keywords: "takas, barter, ikinci el, borsa, güvenli alışveriş, atakasa",
  authors: [{ name: "Atakasa" }],
  openGraph: {
    title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
    description: "Türkiye'nin en güvenli takas ve barter platformu.",
    url: "https://atakasa.com",
    siteName: "A-TAKASA",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "A-TAKASA | Küresel B2B Barter ve Takas Platformu",
    description: "Türkiye'nin en güvenli takas ve barter platformu.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://atakasa.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="tr" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f2540" />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
