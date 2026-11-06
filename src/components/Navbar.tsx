import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold text-marka">🔄 A-Takasa</Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/takas-rehberi" className="btn-ikinci !py-2">Takas rehberi</Link>
        </nav>
      </div>
    </header>
  );
}
