import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} A-TAKASA — Ücretsiz takas platformu. Satış yok, sadece takas.</p>
        <div className="flex gap-4">
          <Link href="/ilanlar" className="hover:text-slate-800">İlanlar</Link>
          <Link href="/sozlesme" className="hover:text-slate-800">Kullanım şartları</Link>
        </div>
      </div>
    </footer>
  );
}
