import SifreFormu from "@/components/SifreFormu";
export const metadata = { title: "Şifre Sıfırla", robots: { index: false } };
export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  return searchParams.token ? <SifreFormu token={searchParams.token} /> : <p className="text-center">Geçersiz bağlantı.</p>;
}
