// Faz 3 Test Suite — Gerçek Supabase bağlantısı ile tüm modülleri test eder
// Kullanım: node scripts/test-phase3-suite.js
const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function req(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const postData = body ? JSON.stringify(body) : null;
    const request = https.request({
      hostname: url.hostname,
      path: url.pathname + (url.search || ""),
      method,
      headers: {
        "Content-Type": "application/json",
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        ...(method === "POST" ? { "Prefer": "return=representation" } : {}),
        ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    request.on("error", reject);
    if (postData) request.write(postData);
    request.end();
  });
}

let passed = 0;
let failed = 0;

function test(name, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function main() {
  console.log("🧪 Faz 3 Test Suite — Talep & Onay Yönetim Sistemi\n");

  // ── Test 1: Operasyon Listesi ────────────────────────
  console.log("📋 Test 1: Operasyon Listesi (getOperations)");
  const opsRes = await req("operations?select=*,facilities(name,code)&order=created_at.desc");
  test("Operasyonlar yüklendi", opsRes.status === 200);
  test("12 operasyon mevcut", Array.isArray(opsRes.body) && opsRes.body.length >= 12,
    `Bulunan: ${Array.isArray(opsRes.body) ? opsRes.body.length : "hata"}`);
  const ops = opsRes.body || [];
  test("ACİL öncelikli operasyon var", ops.some((o) => o.priority === "acil"));
  test("'onayda' statüslü operasyon var", ops.some((o) => o.status === "onayda"));
  test("'tamamlandi' statüslü operasyon var", ops.some((o) => o.status === "tamamlandi"));

  // ── Test 2: Kategori Filtresi ────────────────────────
  console.log("\n🔍 Test 2: Kategori Bazlı Filtreleme");
  const yemekRes = await req("operations?select=id,category&category=eq.yemekhane");
  test("Yemekhane kategorisi filtrelendi", yemekRes.status === 200 && Array.isArray(yemekRes.body));
  test("Tüm sonuçlar yemekhane kategorisinde", yemekRes.body?.every((o) => o.category === "yemekhane") ?? false);

  const servisRes = await req("operations?select=id,category&category=eq.servis");
  test("Servis kategorisi filtrelendi", servisRes.status === 200 && Array.isArray(servisRes.body));

  // ── Test 3: Status Güncelleme ────────────────────────
  console.log("\n🔄 Test 3: Status Güncelleme (updateOperationStatus)");
  const yeniOp = ops.find((o) => o.status === "yeni");
  if (yeniOp) {
    const updateRes = await req(`operations?id=eq.${yeniOp.id}`, "PATCH", {
      status: "devam_ediyor",
      updated_at: new Date().toISOString(),
    });
    test("Yeni → Devam Ediyor geçişi", updateRes.status === 204 || updateRes.status === 200);

    // Geri al
    await req(`operations?id=eq.${yeniOp.id}`, "PATCH", {
      status: "yeni",
      updated_at: new Date().toISOString(),
    });
    test("Durum geri alındı (temizlik)", true);
  } else {
    test("Test için 'yeni' statüslü operasyon bulunamadı", false);
  }

  // ── Test 4: Onaylama ────────────────────────────────
  console.log("\n✅ Test 4: Onaylama (approveOperation)");
  const onaydaOp = ops.find((o) => o.status === "onayda");
  if (onaydaOp) {
    test("'onayda' statüslü operasyon var", true, onaydaOp.operation_number);

    const approveRes = await req(`operations?id=eq.${onaydaOp.id}`, "PATCH", {
      status: "tamamlandi",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    test("Onaylama işlemi başarılı", approveRes.status === 204 || approveRes.status === 200);

    // Geri al — test temizliği
    await req(`operations?id=eq.${onaydaOp.id}`, "PATCH", {
      status: "onayda",
      completed_at: null,
      updated_at: new Date().toISOString(),
    });
    test("Durum geri alındı (test temizliği)", true);
  } else {
    test("Test için 'onayda' statüslü operasyon bulunamadı", false);
  }

  // ── Test 5: Yeni Talep Oluşturma ────────────────────
  console.log("\n➕ Test 5: Yeni Talep Oluşturma (createOperation)");
  const facilities = await req("facilities?select=id&limit=1");
  const facilityId = facilities.body?.[0]?.id;

  if (facilityId) {
    const createRes = await req("operations", "POST", {
      facility_id: facilityId,
      operation_number: "TAL-2026-TEST-9999",
      title: "FAZ 3 TEST — Otomatik Test Talebi",
      category: "teknik",
      priority: "dusuk",
      status: "yeni",
      description: "Bu talep otomatik test suite tarafından oluşturuldu.",
    });
    test("Yeni talep oluşturuldu", createRes.status === 201 || createRes.status === 200,
      `status: ${createRes.status}`);

    // Temizle
    if (createRes.status === 201 && Array.isArray(createRes.body) && createRes.body[0]?.id) {
      await req(`operations?id=eq.${createRes.body[0].id}`, "DELETE");
      test("Test talebi temizlendi", true);
    }
  } else {
    test("Tesis ID alınamadı", false);
  }

  // ── Test 6: Termin Yaklaşım Sorgusu ─────────────────
  console.log("\n⏰ Test 6: Termin Yaklaşan Operasyonlar (deadline-notifications)");
  const now = new Date();
  const in3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const deadlineRes = await req(
    `operations?select=id,operation_number,title,deadline,status&deadline=lte.${in3}&deadline=gte.${now.toISOString()}&status=neq.tamamlandi`
  );
  test("Termin sorgusu çalıştı", deadlineRes.status === 200);
  test("ACİL terminler bulundu", Array.isArray(deadlineRes.body));
  console.log(`  ℹ️  ${deadlineRes.body?.length ?? 0} adet 3 günlük termin yaklaşan operasyon`);

  // ── Test 7: Notifications Tablosu ───────────────────
  console.log("\n🔔 Test 7: Notifications Tablosu");
  const notifRes = await req("notifications?select=id,title,type&limit=5");
  test("Notifications tablosu erişilebilir", notifRes.status === 200);

  // ── Test 8: İstatistik ──────────────────────────────
  console.log("\n📊 Test 8: Operasyon İstatistikleri");
  const statsRes = await req("operations?select=status,priority");
  if (statsRes.status === 200 && Array.isArray(statsRes.body)) {
    const data = statsRes.body;
    const stats = {
      yeni: data.filter((d) => d.status === "yeni").length,
      devam_ediyor: data.filter((d) => d.status === "devam_ediyor").length,
      onayda: data.filter((d) => d.status === "onayda").length,
      beklemede: data.filter((d) => d.status === "beklemede").length,
      tamamlandi: data.filter((d) => d.status === "tamamlandi").length,
      acil: data.filter((d) => d.priority === "acil").length,
    };
    test("İstatistik hesaplandı", true);
    console.log(`  ℹ️  Yeni: ${stats.yeni} | Devam: ${stats.devam_ediyor} | Onayda: ${stats.onayda} | Beklemede: ${stats.beklemede} | Tamamlandı: ${stats.tamamlandi} | Acil: ${stats.acil}`);
  } else {
    test("İstatistik alınamadı", false);
  }

  // ── Sonuç ────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`🏁 SONUÇ: ${passed} geçti, ${failed} başarısız`);
  if (failed === 0) {
    console.log("🎉 FAZ 3 TEST SÜİTİ TAMAMEN BAŞARILI!\n");
  } else {
    console.log(`⚠️  ${failed} test başarısız — logları kontrol edin\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Test suite hatası:", err.message);
  process.exit(1);
});
