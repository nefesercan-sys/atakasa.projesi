import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-8">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00f260]/10 via-[#030712] to-[#030712] -z-10"></div>
      
      <h1 className="text-6xl md:text-8xl font-black uppercase mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(0,242,96,0.3)]">
        ATA<span className="text-[#00f260]">KASA.</span>
      </h1>
      <p className="text-slate-400 mb-12 font-black tracking-[0.5em] uppercase text-xs md:text-sm">
        Güvenli Siber Takas Ağı
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <Link 
          href="/emanet-kasa" 
          className="bg-[#0b0f19] border-2 border-[#00f260]/30 text-[#00f260] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#00f260]/10 hover:border-[#00f260] transition-all flex items-center justify-center"
        >
          🛡️ EMANET KASA
        </Link>
        <Link 
          href="/takas-teklif" 
          className="bg-[#00f260] text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,242,96,0.4)] hover:scale-105 transition-all flex items-center justify-center"
        >
          🚀 TAKAS BAŞLAT
        </Link>
      </div>
    </div>
  );
}
