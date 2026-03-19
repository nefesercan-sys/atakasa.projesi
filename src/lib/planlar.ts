export type PlanTipi = "ucretsiz" | "starter" | "pro" | "business";

export const PLANLAR = {
  ucretsiz: {
    ad: "Ücretsiz",
    fiyatAylik: 0,
    fiyatYillik: 0,
    emoji: "🆓",
    renk: "#64748b",
    ozellikler: {
      ilanSayisi: 3,
      oneCikarma: 0,
      mesajSayisi: 10,
      takasGuvencesi: false,
      profilRozeti: null,
      analizRaporu: false,
      destekOnceligi: false,
    },
  },
  starter: {
    ad: "Starter",
    fiyatAylik: 49,
    fiyatYillik: 490,
    emoji: "⭐",
    renk: "#2563eb",
    ozellikler: {
      ilanSayisi: 15,
      oneCikarma: 2,
      mesajSayisi: 100,
      takasGuvencesi: false,
      profilRozeti: "⭐ Doğrulanmış",
      analizRaporu: "temel",
      destekOnceligi: false,
    },
  },
  pro: {
    ad: "Pro",
    fiyatAylik: 149,
    fiyatYillik: 1490,
    emoji: "💎",
    renk: "#7c3aed",
    populer: true,
    ozellikler: {
      ilanSayisi: 50,
      oneCikarma: 10,
      mesajSayisi: 500,
      takasGuvencesi: true,
      profilRozeti: "💎 Pro Üye",
      analizRaporu: "gelismis",
      destekOnceligi: true,
    },
  },
  business: {
    ad: "Business",
    fiyatAylik: 399,
    fiyatYillik: 3990,
    emoji: "👑",
    renk: "#d97706",
    ozellikler: {
      ilanSayisi: Infinity,
      oneCikarma: Infinity,
      mesajSayisi: Infinity,
      takasGuvencesi: true,
      profilRozeti: "👑 Business",
      analizRaporu: "tam",
      destekOnceligi: true,
    },
  },
};

export function planKontrol(
  kullaniciPlani: PlanTipi,
  ozellik: keyof typeof PLANLAR.ucretsiz.ozellikler,
  mevcutKullanim?: number
): { izinli: boolean; limit?: number; mesaj?: string } {
  const plan = PLANLAR[kullaniciPlani];
  const deger = plan.ozellikler[ozellik];

  if (typeof deger === "number") {
    if (deger === Infinity) return { izinli: true };
    if (mevcutKullanim !== undefined && mevcutKullanim >= deger) {
      return {
        izinli: false,
        limit: deger,
        mesaj: `${plan.ad} planında bu özellik için limit ${deger}. Yükseltmek için tıklayın.`,
      };
    }
    return { izinli: true, limit: deger };
  }

  if (typeof deger === "boolean") {
    return {
      izinli: deger,
      mesaj: deger ? undefined : `Bu özellik ${plan.ad} planında mevcut değil.`,
    };
  }

  return { izinli: !!deger };
}
