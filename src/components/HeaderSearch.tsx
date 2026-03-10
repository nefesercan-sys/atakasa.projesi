"use client";
export default function HeaderSearch() {
  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8">
      <div className="w-full bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-2.5 flex items-center gap-3 focus-within:border-[#00f260]/50 transition-all shadow-inner">
        <span className="text-slate-500 text-sm">✨</span>
        <input
          type="text"
          placeholder="BORSADA VARLIK ARA..."
          className="bg-transparent border-none text-xs font-bold uppercase tracking-widest outline-none w-full placeholder:text-slate-600 text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value;
              if (val) window.location.href = `/?q=${encodeURIComponent(val)}`;
            }
          }}
        />
      </div>
    </div>
  );
}
