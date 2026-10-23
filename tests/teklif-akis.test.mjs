import assert from "node:assert/strict";
import { gecis, iletisimAcik } from "../src/lib/teklif-akis.ts";

const bekliyor = { durum: "bekliyor", gonderenOnay: false, aliciOnay: false };
let n = 0;
const t = (ad, f) => { f(); n++; console.log("✓", ad); };

t("alıcı kabul eder → ilanlar takasta, diğer teklifler iptal", () => {
  const r = gecis(bekliyor, "kabul", "alici");
  assert.ok(r.ok); assert.equal(r.yeni.durum, "kabul"); assert.equal(r.ilanlar, "takasta"); assert.equal(r.digerTeklifleriIptalEt, true);
});
t("gönderen kendi teklifini kabul edemez", () => assert.equal(gecis(bekliyor, "kabul", "gonderen").ok, false));
t("gönderen reddedemez", () => assert.equal(gecis(bekliyor, "red", "gonderen").ok, false));
t("alıcı reddeder", () => { const r = gecis(bekliyor, "red", "alici"); assert.ok(r.ok); assert.equal(r.yeni.durum, "red"); });
t("alıcı bekleyen teklifi iptal edemez (reddeder)", () => assert.equal(gecis(bekliyor, "iptal", "alici").ok, false));
t("gönderen bekleyen teklifi geri çeker", () => { const r = gecis(bekliyor, "iptal", "gonderen"); assert.ok(r.ok); assert.equal(r.yeni.durum, "iptal"); assert.equal(r.ilanlar, null); });
const kabul = { durum: "kabul", gonderenOnay: false, aliciOnay: false };
t("beklemedeki teklife onay verilemez", () => assert.equal(gecis(bekliyor, "onayla", "gonderen").ok, false));
t("tek taraf onayı takası bitirmez", () => { const r = gecis(kabul, "onayla", "gonderen"); assert.ok(r.ok); assert.equal(r.yeni.durum, "kabul"); assert.equal(r.yeni.gonderenOnay, true); assert.equal(r.ilanlar, null); });
t("iki taraf onaylayınca tamamlanır", () => {
  const a = gecis(kabul, "onayla", "gonderen"); const b = gecis(a.yeni, "onayla", "alici");
  assert.ok(b.ok); assert.equal(b.yeni.durum, "tamamlandi"); assert.equal(b.ilanlar, "takas_oldu");
});
t("aynı taraf iki kez onaylasa da tek sayılır", () => { const a = gecis(kabul, "onayla", "alici"); const b = gecis(a.yeni, "onayla", "alici"); assert.equal(b.yeni.durum, "kabul"); });
t("kabulden sonra iki taraftan biri vazgeçebilir → ilanlar yeniden aktif", () => {
  for (const rol of ["gonderen", "alici"]) { const r = gecis(kabul, "iptal", rol); assert.ok(r.ok); assert.equal(r.ilanlar, "aktif"); assert.equal(r.yeni.gonderenOnay, false); }
});
t("tamamlanmış takas iptal edilemez", () => assert.equal(gecis({ durum: "tamamlandi", gonderenOnay: true, aliciOnay: true }, "iptal", "alici").ok, false));
t("reddedilmiş teklif tekrar kabul edilemez", () => assert.equal(gecis({ ...bekliyor, durum: "red" }, "kabul", "alici").ok, false));
t("iletişim bilgisi yalnızca kabul/tamamlandıda açık", () => {
  assert.equal(iletisimAcik("bekliyor"), false); assert.equal(iletisimAcik("red"), false); assert.equal(iletisimAcik("iptal"), false);
  assert.equal(iletisimAcik("kabul"), true); assert.equal(iletisimAcik("tamamlandi"), true);
});
console.log(`\n${n} test geçti`);
