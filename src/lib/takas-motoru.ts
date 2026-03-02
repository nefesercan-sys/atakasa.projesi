export const takasKontrol = (teklifFiyati: number, hedefFiyat: number) => {
  const altSinir = hedefFiyat * 0.70; // En fazla %30 ucuz olabilir
  
  if (teklifFiyati < altSinir) {
    return {
      uygun: false,
      mesaj: `Uyarı: Teklifiniz hedef üründen en fazla %30 ucuz olabilir. (Gereken Min: ${altSinir} ₺ / Sizin: ${teklifFiyati} ₺)`
    };
  }
  
  return { uygun: true, mesaj: "Teklif Şartları Uygun! Takas Başlatılabilir." };
};
