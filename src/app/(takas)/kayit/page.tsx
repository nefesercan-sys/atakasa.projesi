import type { Metadata } from "next";
import KimlikFormu from "@/components/KimlikFormu";
export const metadata: Metadata = { title: "Ücretsiz Üye Ol", description: "A-Takasa'ya ücretsiz üye olun, eşyalarınızı takas edin." };
export default function Page() { return <KimlikFormu mod="kayit" />; }
