// Likya Home (sineklik & panjur) için KENDİ kök düzeni: A-Takasa menüsü, alt bilgisi ve Organization/WebSite JSON-LD'si bu bölüme karışmaz.
import "../../globals.css";
import { notFound } from "next/navigation";
import { SP_LANGS, SP_BASE, spIsRtl } from "@/lib/sineklik-panjur";

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#030712" };
export const metadata = { metadataBase: new URL(SP_BASE) };

export default function LikyaRootLayout({ children, params }) {
  const lang = params.lang;
  if (!SP_LANGS.includes(lang)) notFound();
  return (
    <html lang={lang} dir={spIsRtl(lang) ? "rtl" : "ltr"}>
      <body className="bg-[#030712] text-slate-200">{children}</body>
    </html>
  );
}
