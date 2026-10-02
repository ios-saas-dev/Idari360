// Faz 3: Operations seed — Supabase service_role key ile
// Kullanım: node scripts/seed-operations.js
const https = require("https");
const fs = require("fs");

// .env.local okuma
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ .env.local içinde NEXT_PUBLIC_SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY bulunamadı");
  process.exit(1);
}

function supabaseRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const postData = JSON.stringify(body);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ""),
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Prefer": "return=minimal",
          ...(body ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("🔗 Supabase'e service_role ile bağlanılıyor...");
  console.log(`   URL: ${SUPABASE_URL}`);

  // Tesisleri al
  const facRes = await supabaseRequest("facilities?select=id,name,code&order=name", "GET");
  if (facRes.status !== 200 || !Array.isArray(facRes.body) || facRes.body.length === 0) {
    console.error("❌ Tesisler alınamadı:", facRes.status, JSON.stringify(facRes.body));
    process.exit(1);
  }
  const facilities = facRes.body;
  console.log(`✅ ${facilities.length} tesis bulundu:`, facilities.map((f) => f.code).join(", "));

  // Mevcut operasyonları kontrol et
  const countRes = await supabaseRequest("operations?select=id&limit=1", "GET");
  if (countRes.status === 200 && Array.isArray(countRes.body) && countRes.body.length > 0) {
    console.log("ℹ️  Operasyonlar zaten mevcut, seed atlanıyor.");
    return;
  }

  const fac = (i) => facilities[i % facilities.length].id;
  const now = new Date();
  const dt = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const operations = [
    { facility_id: fac(0), operation_number: "TAL-2026-0001", title: "Agora Yemekhane Soğuk Hava Deposu Arızası", category: "yemekhane", priority: "acil", status: "onayda", description: "Soğuk hava deposu kompresörü çalışmıyor, gıda güvenliği riski oluştu.", deadline: dt(1) },
    { facility_id: fac(1), operation_number: "TAL-2026-0002", title: "Kadıköy Servis Araç Fren Arızası", category: "servis", priority: "acil", status: "devam_ediyor", description: "Araç sefere çıkamıyor, fren balataları için bakım servisi bildirdi.", deadline: dt(1) },
    { facility_id: fac(0), operation_number: "TAL-2026-0003", title: "Maslak Merkez Klima Bakımı", category: "teknik", priority: "yuksek", status: "yeni", description: "5. kat ofis katı klima bakımı yapılmadı, şikayetler arttı.", deadline: dt(3) },
    { facility_id: fac(2 % facilities.length), operation_number: "TAL-2026-0004", title: "Şube Temizlik Personel Eksikliği", category: "temizlik", priority: "yuksek", status: "devam_ediyor", description: "2 temizlik personeli ayrıldı, ikame için işe alım gerekiyor.", deadline: dt(7) },
    { facility_id: fac(1), operation_number: "TAL-2026-0005", title: "Beşiktaş Filo Araç Muayene Yenileme", category: "filo", priority: "yuksek", status: "onayda", description: "3 araçın muayene tarihi geçmiş, trafik cezası riski var.", deadline: dt(3) },
    { facility_id: fac(0), operation_number: "TAL-2026-0006", title: "Yemekhane Saladbar Ünite Yenileme", category: "yemekhane", priority: "orta", status: "yeni", description: "Mevcut saladbar üniteleri eskidi, hijyen denetiminde eleştirildi.", deadline: dt(14) },
    { facility_id: fac(2 % facilities.length), operation_number: "TAL-2026-0007", title: "Güvenlik Kamera Sistemi Güncelleme", category: "guvenlik", priority: "orta", status: "beklemede", description: "Tedarikçi teklifi bekleniyor. 3 kamera kör nokta oluşturuyor.", deadline: dt(14) },
    { facility_id: fac(3 % facilities.length), operation_number: "TAL-2026-0008", title: "Varlık Demirbaş Sayımı Q4", category: "varlik", priority: "orta", status: "yeni", description: "Yıl sonu demirbaş sayımı yapılacak, ekipler planlanıyor.", deadline: dt(30) },
    { facility_id: fac(0), operation_number: "TAL-2026-0009", title: "Servis Araçları Cam Filmi Yenileme", category: "servis", priority: "orta", status: "devam_ediyor", description: "Tüm servis araçları cam filmi ömrünü tamamladı.", deadline: dt(14) },
    { facility_id: fac(1), operation_number: "TAL-2026-0010", title: "Atıksu Kantar Kalibrasyon Onayı", category: "temizlik", priority: "dusuk", status: "yeni", description: "Atık taşıma kantarının yıllık kalibrasyonu gerekiyor.", deadline: dt(30) },
    { facility_id: fac(0), operation_number: "TAL-2026-0011", title: "Yemekhane Catering Sözleşme Yenileme", category: "yemekhane", priority: "orta", status: "tamamlandi", description: "Catering firması ile 2026 sözleşmesi imzalandı.", completed_at: dt(-2) },
    { facility_id: fac(2 % facilities.length), operation_number: "TAL-2026-0012", title: "Temizlik Malzeme Temin Q3", category: "temizlik", priority: "dusuk", status: "tamamlandi", description: "Q3 temizlik malzemeleri sipariş edildi ve teslim alındı.", completed_at: dt(-2) },
  ];

  let inserted = 0;
  for (const op of operations) {
    const res = await supabaseRequest("operations", "POST", op);
    if (res.status === 201 || res.status === 200) {
      console.log(`  ✅ ${op.operation_number}: ${op.title}`);
      inserted++;
    } else {
      console.log(`  ⚠️  ${op.operation_number}: ${JSON.stringify(res.body)} (status ${res.status})`);
    }
  }

  console.log(`\n🎉 ${inserted}/${operations.length} operasyon başarıyla eklendi!`);
}

main().catch((err) => {
  console.error("❌ Beklenmedik hata:", err.message);
  process.exit(1);
});
