"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-teal-800">A-TAKASA<span className="text-amber-500">.</span></Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/ilanlar" className="hidden rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100 sm:block">İlanlar</Link>
          <Link href="/ilan-ver" className="btn btn-primary !px-4 !py-2">+ İlan ver</Link>
          {status === "authenticated" ? (
            <>
              <Link href="/panel" className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">Panelim</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="hidden rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 sm:block" aria-label={`${session?.user?.name ?? ""} çıkış`}>Çıkış</button>
            </>
          ) : (
            <Link href="/giris" className="rounded-lg px-3 py-2 font-medium text-slate-700 hover:bg-slate-100">Giriş</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
