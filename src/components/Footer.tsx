import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#050505] border-t border-white/10 py-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Telif Hakkı Kısmı */}
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
          © {new Date().getFullYear()} ATAKASA.COM - TÜM HAKLARI SAKLIDIR.
        </div>
        
        {/* Yasal Linkler */}
        <nav className="flex items-center gap-6">
          <Link href="/sozlesme" className="text-slate-400 hover:text-[#00f260] transition-colors text-[10px] font-black uppercase tracking-widest">
            Kullanıcı Sözleşmesi ve KVKK
          </Link>
        </nav>

      </div>
    </footer>
  );
}
