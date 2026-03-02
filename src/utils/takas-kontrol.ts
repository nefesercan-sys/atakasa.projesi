export const fiyatKontrol = (teklif: number, hedef: number) => {
  const minFiyat = hedef * 0.70; // %30'dan fazla ucuz olamaz
  if (teklif < minFiyat) {
    return { 
      status: false, 
      msg: `Siber Uyarı: Teklifiniz en fazla %30 ucuz olabilir. Min: ${minFiyat}₺ gerekli.` 
    };
  }
  return { status: true, msg: "Şartlar Uygun!" };
};
