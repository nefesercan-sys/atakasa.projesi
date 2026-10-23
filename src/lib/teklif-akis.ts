// Takas teklifi durum makinesi (saf fonksiyon; veritabanından bağımsız, test edilebilir).
//
//  bekliyor ──kabul (alıcı)──▶ kabul ──onayla (iki taraf da)──▶ tamamlandi
//     │                          │
//     ├─red (alıcı)─▶ red        └─iptal (iki taraftan biri)──▶ iptal (ilanlar yeniden aktif)
//     └─iptal (gönderen)─▶ iptal
export type TeklifDurum = "bekliyor" | "kabul" | "red" | "iptal" | "tamamlandi";
export type Islem = "kabul" | "red" | "iptal" | "onayla";
export type Rol = "gonderen" | "alici";

export interface TeklifDurumu {
  durum: TeklifDurum;
  gonderenOnay: boolean;
  aliciOnay: boolean;
}

export type IlanEtkisi = "takasta" | "aktif" | "takas_oldu" | null;

export type Sonuc =
  | { ok: true; yeni: TeklifDurumu; ilanlar: IlanEtkisi; digerTeklifleriIptalEt: boolean }
  | { ok: false; hata: string };

export function gecis(t: TeklifDurumu, islem: Islem, rol: Rol): Sonuc {
  const hayir = (hata: string): Sonuc => ({ ok: false, hata });
  const ayni = { ...t };

  switch (islem) {
    case "kabul":
      if (rol !== "alici") return hayir("Teklifi yalnızca ilan sahibi kabul edebilir.");
      if (t.durum !== "bekliyor") return hayir("Bu teklif artık beklemede değil.");
      return { ok: true, yeni: { durum: "kabul", gonderenOnay: false, aliciOnay: false }, ilanlar: "takasta", digerTeklifleriIptalEt: true };

    case "red":
      if (rol !== "alici") return hayir("Teklifi yalnızca ilan sahibi reddedebilir.");
      if (t.durum !== "bekliyor") return hayir("Bu teklif artık beklemede değil.");
      return { ok: true, yeni: { ...ayni, durum: "red" }, ilanlar: null, digerTeklifleriIptalEt: false };

    case "iptal":
      if (t.durum === "bekliyor") {
        if (rol !== "gonderen") return hayir("Bekleyen teklifi yalnızca gönderen geri çekebilir (ilan sahibi reddedebilir).");
        return { ok: true, yeni: { ...ayni, durum: "iptal" }, ilanlar: null, digerTeklifleriIptalEt: false };
      }
      if (t.durum === "kabul") {
        // Kabul edilmiş ama henüz tamamlanmamış takas: iki taraftan biri vazgeçebilir, ilanlar yeniden açılır.
        return { ok: true, yeni: { durum: "iptal", gonderenOnay: false, aliciOnay: false }, ilanlar: "aktif", digerTeklifleriIptalEt: false };
      }
      return hayir("Bu teklif iptal edilemez.");

    case "onayla": {
      if (t.durum !== "kabul") return hayir("Önce teklifin kabul edilmesi gerekir.");
      const yeni: TeklifDurumu = { ...ayni };
      if (rol === "gonderen") yeni.gonderenOnay = true;
      else yeni.aliciOnay = true;
      if (yeni.gonderenOnay && yeni.aliciOnay) {
        yeni.durum = "tamamlandi";
        return { ok: true, yeni, ilanlar: "takas_oldu", digerTeklifleriIptalEt: false };
      }
      return { ok: true, yeni, ilanlar: null, digerTeklifleriIptalEt: false };
    }
  }
}

/** İletişim bilgisi (telefon/e-posta) yalnızca kabul edilmiş veya tamamlanmış takasta paylaşılır. */
export const iletisimAcik = (d: TeklifDurum) => d === "kabul" || d === "tamamlandi";
