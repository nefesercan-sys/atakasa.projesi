"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  TrendingUp, TrendingDown, Activity, Search,
  RefreshCw, SlidersHorizontal,
} from "lucide-react";

export default function BorsaTahtasi() {
  const router = useRouter();
  const [arama, setArama] = useState("");
  const [ilanlar, setIlanlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [siralama, setSiralama] = useState<"yeni" | "fiyat_artan" | "fiyat_azalan" | "trend">("yeni");
  const [aktifKategori, setAktifKategori] = useState("Tümü");
  const [yenileniyor, setYenileniyor] = useState(false);
  const [sonGuncelleme, setSonGuncelleme] = useState("");

  const kategoriler = ["Tümü", "Elektronik", "Araç", "Emlak", "Mobilya", "Giyim", "Diğer"];

  const veriCek = useCallback(async (sessiz = false) => {
    if (!sessiz) setLoading(true);
    else setYenileniyor(true);
    try {
      const res = await fetch("/api/varliklar?limit=100", {
        next: { revalidate: 30 },
      } as any);
      const data = await res.json();
      const liste = Array.isArray(data) ? data : data.data || data.ilanlar || data.varliklar || [];
      setIlanlar(liste);
      setSonGuncelleme(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
        })
      );
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
      setYenileniyor(false);
    }
  }, []);

  useEffect(() => {
    veriCek();
    const interval = setInterval(() => veriCek(true), 30000);
    return () => clearInterval(interval);
  }, [veriCek]);

  const getImageUrl = useCallback((ilan: any): string | null => {
    if (!ilan) return null;
    const check = (arr: any) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    return check(ilan.resimler) || check(ilan.medyalar) || check(ilan.images) || null;
  }, []);

  const filtrelenmis = useMemo(() => {
    let liste = [...ilanlar];

    if (arama.trim()) {
      const q = arama.toLowerCase();
      liste = liste.filter(i =>
        (i.baslik || "").toLowerCase().includes(q) ||
        (i.kategori || "").toLowerCase().includes(q) ||
        (i.sehir || "").toLowerCase().includes(q)
      );
    }

    if (aktifKategori !== "Tümü") {
      liste = liste.filter(i =>
        (i.kategori || "").toLowerCase().includes(aktifKategori.toLowerCase())
      );
    }

    switch (siralama) {
      case "fiyat_artan": liste.sort((a, b) => Number(a.fiyat || 0) - Number(b.fiyat || 0)); break;
      case "fiyat_azalan": liste.sort((a, b) => Number(b.fiyat || 0) - Number(a.fiyat || 0)); break;
      case "trend": liste.sort((a, b) => (b.degisimYuzdesi || 0) - (a.degisimYuzdesi || 0)); break;
      default: liste.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return liste;
  }, [ilanlar, arama, aktifKategori, siralama]);

  const istatistik = useMemo(() => {
    const pozitif = ilanlar.filter(i => (i.degisimYuzdesi || 0) > 0).length;
    const negatif = ilanlar.filter(i => (i.degisimYuzdesi || 0) < 0).length;
    const toplamHacim = ilanlar.reduce((acc, i) => acc + Number(i.fiyat || 0), 0);
    return { pozitif, negatif, toplamHacim, toplam: ilanlar.length };
  }, [ilanlar]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0e1a",
      color: "#e8eaf0",
      fontFamily: "'DM Sans', var(--font-sans), sans-serif",
      paddingBottom: 80,
    }}>

      {/* ÜST BAR */}
      <div style={{
        background: "rgba(10,14,26,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 20px 0",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Logo + Yenile */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={20} style={{ color: "#c9a84c" }} />
              <span style={{
                fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em",
                fontFamily: "'Playfair Display', serif",
              }}>
                A-TAKASA <span style={{ color: "#c9a84c" }}>BORSA</span>
              </span>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.1em", marginTop: 2 }}>
              {sonGuncelleme ? `SON GÜNCELLEME: ${sonGuncelleme}` : "CANLI VERİ AKIŞI"}
            </div>
          </div>
          <button
            onClick={() => veriCek(true)}
            disabled={yenileniyor}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)",
              color: "#c9a84c", fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            <RefreshCw size={13} style={{ animation: yenileniyor ? "spin 1s linear infinite" : "none" }} />
            {yenileniyor ? "..." : "YENİLE"}
          </button>
        </div>

        {/* İstatistik Bant */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
          {[
            { label: "TOPLAM VARLIK", deger: istatistik.toplam, renk: "#c9a84c" },
            { label: "YÜKSELENLer", deger: istatistik.pozitif, renk: "#22c55e" },
            { label: "DÜŞENLER", deger: istatistik.negatif, renk: "#ef4444" },
            {
              label: "TOPLAM HACIM",
              deger: istatistik.toplamHacim > 0
                ? (istatistik.toplamHacim / 1000000).toFixed(1) + "M ₺"
                : "—",
              renk: "#818cf8",
            },
          ].map((s) => (
            <div key={s.label} style={{
              flex: "0 0 auto", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
              padding: "8px 14px", minWidth: 90,
            }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.renk, letterSpacing: "-0.02em" }}>
                {s.deger}
              </div>
            </div>
          ))}
        </div>

        {/* Arama */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: "10px 14px", marginBottom: 12,
        }}>
          <Search size={15} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Varlık, kategori veya şehir ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            style={{
              flex: 1, background: "none", border: "none", color: "#e8eaf0",
              fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />
          {arama && (
            <button onClick={() => setArama("")} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.3)",
              cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
            }}>×</button>
          )}
        </div>

        {/* Kategori Filtreleri */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
          {kategoriler.map((k) => (
            <button key={k} onClick={() => setAktifKategori(k)} style={{
              padding: "5px 14px", borderRadius: 999, border: "1px solid",
              borderColor: aktifKategori === k ? "#c9a84c" : "rgba(255,255,255,0.1)",
              background: aktifKategori === k ? "rgba(201,168,76,0.15)" : "transparent",
              color: aktifKategori === k ? "#c9a84c" : "rgba(255,255,255,0.4)",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
            }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* SIRALAMA BAR */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        <SlidersHorizontal size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        {[
          { id: "yeni", label: "En Yeni" },
          { id: "trend", label: "🔥 Trend" },
          { id: "fiyat_azalan", label: "Pahalıdan Ucuza" },
          { id: "fiyat_artan", label: "Ucuzdan Pahalıya" },
        ].map((s) => (
          <button key={s.id} onClick={() => setSiralama(s.id as any)} style={{
            padding: "4px 12px", borderRadius: 999,
            background: siralama === s.id ? "rgba(201,168,76,0.2)" : "transparent",
            border: `1px solid ${siralama === s.id ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: siralama === s.id ? "#c9a84c" : "rgba(255,255,255,0.4)",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.15s",
          }}>
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>
          {filtrelenmis.length} sonuç
        </span>
      </div>

      {/* TABLO BAŞLIĞI */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 100px 80px",
        padding: "8px 20px", fontSize: 9, fontWeight: 800,
        color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em",
        textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div>Varlık</div>
        <div style={{ textAlign: "right" }}>Değer</div>
        <div style={{ textAlign: "right" }}>Trend</div>
      </div>

      {/* LİSTE */}
      <div style={{ padding: "4px 8px" }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 100px 80px",
              padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)",
              gap: 12, alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.07)", flexShrink: 0 }} />
                <div>
                  <div style={{ width: 120, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.07)", marginBottom: 6 }} />
                  <div style={{ width: 60, height: 9, borderRadius: 4, background: "rgba(255,255,255,0.05)" }} />
                </div>
              </div>
              <div style={{ height: 14, borderRadius: 6, background: "rgba(255,255,255,0.07)" }} />
              <div style={{ height: 28, borderRadius: 8, background: "rgba(255,255,255,0.07)" }} />
            </div>
          ))
        ) : filtrelenmis.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.3)" }}>
            <Activity size={40} style={{ opacity: 0.2, margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Sonuç bulunamadı</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Farklı filtreler deneyin</p>
          </div>
        ) : (
          filtrelenmis.map((ilan, index) => {
            const gorsel = getImageUrl(ilan);
            const fiyat = Number(ilan.fiyat || 0);
            const degisim = Number(ilan.degisimYuzdesi || 0);
            const pozitif = degisim >= 0;
            // İlk 6 görsel öncelikli yüklensin (LCP için kritik)
            const oncelikli = index < 6;

            return (
              <div
                key={ilan._id}
                onClick={() => router.push(`/varlik/${ilan._id}`)}
                style={{
                  display: "grid", gridTemplateColumns: "1fr 100px 80px",
                  padding: "12px", borderRadius: 14, cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s", gap: 8, alignItems: "center",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* Sol: Görsel + Bilgi */}
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                  {/* Görsel — next/image ile optimize */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 10, overflow: "hidden",
                    background: "rgba(255,255,255,0.07)", flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.06)",
                    position: "relative",
                  }}>
                    {gorsel ? (
                      <Image
                        src={gorsel}
                        alt={ilan.baslik || "Varlık görseli"}
                        fill
                        sizes="48px"
                        priority={oncelikli}
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) parent.style.display = "none";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 18, color: "rgba(255,255,255,0.2)",
                      }}>
                        {ilan.kategori?.[0] || "?"}
                      </div>
                    )}
                  </div>

                  {/* Bilgi */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 700, color: "#e8eaf0",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      marginBottom: 3,
                    }}>
                      {ilan.baslik}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                        background: "rgba(201,168,76,0.12)", color: "#c9a84c",
                        padding: "2px 7px", borderRadius: 4,
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}>
                        {(ilan.kategori || "GENEL").toUpperCase().slice(0, 10)}
                      </span>
                      {ilan.sehir && (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                          📍 {ilan.sehir}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Orta: Fiyat */}
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontSize: 14, fontWeight: 800, color: "#e8eaf0",
                    letterSpacing: "-0.02em", fontStyle: "italic",
                  }}>
                    {fiyat > 0 ? fiyat.toLocaleString("tr-TR") : "—"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>₺</div>
                </div>

                {/* Sağ: Trend */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 8px", borderRadius: 8, fontSize: 10, fontWeight: 800,
                    background: pozitif ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: pozitif ? "#22c55e" : "#ef4444",
                    border: `1px solid ${pozitif ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}>
                    {pozitif ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {degisim !== 0 ? `${pozitif ? "+" : ""}${degisim.toFixed(1)}%` : "0%"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ALT BİLGİ */}
      {!loading && filtrelenmis.length > 0 && (
        <div style={{
          textAlign: "center", padding: "20px 24px",
          fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 600,
        }}>
          {filtrelenmis.length} / {ilanlar.length} varlık gösteriliyor
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { display: none; }
        body { background: #0a0e1a; }
      `}</style>
    </div>
  );
}
