import type { Metadata } from "next";
import KimlikFormu from "@/components/KimlikFormu";
export const metadata: Metadata = { title: "Giriş", robots: { index: false } };
export default function Page() { return <KimlikFormu mod="giris" />; }
