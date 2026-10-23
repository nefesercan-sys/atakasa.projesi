import Link from "next/link";
import { oturumAl } from "@/lib/oturum";
import CikisButonu from "./CikisButonu";

export default async function Navbar() {
  const o = await oturumAl().catch(() => null);
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold text-marka">🔄 A-Takasa</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/ilan-ver" className="btn !py-2">+ İlan Ver</Link>
          {o ? (
            <>
              <Link href="/panel" className="btn-ikinci !py-2">Panelim</Link>
              <CikisButonu />
            </>
          ) : (
            <Link href="/giris" className="btn-ikinci !py-2">Giriş</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
