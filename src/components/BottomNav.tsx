"use client";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, RotateCcw, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname?.startsWith("/panel")) return null;

  return (
    <>
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "#fff",
          borderTop: "1px solid #e4eaf2",
          height: "64px",
          paddingBottom: "env(safe-area-inset-bottom)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
        className="bottom-nav-mobile"
      >
        <button
          onClick={() => router.push("/")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: pathname === "/" ? "#0f2540" : "#8097b1", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}
        >
          <Home size={22} />
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>Anasayfa</span>
        </button>

        <button
          onClick={() => router.push("/kesfet")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: pathname?.startsWith("/kesfet") ? "#0f2540" : "#8097b1", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}
        >
          <Search size={22} />
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>Kesfet</span>
        </button>

        <button
          onClick={() => router.push("/ilan-ver")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}
        >
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#0f2540", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 300, marginBottom: 3, marginTop: -22, boxShadow: "0 4px 18px rgba(15,37,64,0.38)" }}>+</div>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#8097b1", lineHeight: 1 }}>Ilan Ver</span>
        </button>

        <button
          onClick={() => router.push("/panel?tab=gelen_takas")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: "#8097b1", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}
        >
          <RotateCcw size={22} />
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>Takaslar</span>
        </button>

        <button
          onClick={() => router.push("/panel")}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "none", border: "none", cursor: "pointer", color: "#8097b1", fontFamily: "inherit", WebkitTapHighlightColor: "transparent" }}
        >
          <User size={22} />
          <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>Profilim</span>
        </button>
      </nav>

      <style>{`
        .bottom-nav-mobile {
          display: none !important;
        }
        @media (max-width: 768px) {
          .bottom-nav-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
