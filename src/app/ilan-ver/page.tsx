import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { oturumAl } from "@/lib/oturum";
import IlanFormu from "@/components/IlanFormu";
export const metadata: Metadata = { title: "İlan Ver", robots: { index: false } };
export default async function Page() {
  if (!(await oturumAl())) redirect("/giris");
  return <IlanFormu />;
}
