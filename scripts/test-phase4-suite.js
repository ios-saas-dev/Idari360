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

function supabaseRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ""),
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function testPhase4() {
  console.log("🚀 Faz 4 Dashboard & Raporlama Testleri Başlıyor...\n");
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [GEÇTİ] ${message}`);
      passed++;
    } else {
      console.error(`❌ [HATA] ${message}`);
    }
  }

  // 1. Operations tablosundan dashboard için veri okuma (DashboardStats)
  try {
    const ops = await supabaseRequest("operations?select=status,category", "GET");
    assert(ops.status === 200 && Array.isArray(ops.body), "Dashboard için operations verisi çekilebiliyor.");
    assert(ops.body.length >= 0, `Veritabanında ${ops.body.length} adet operasyon bulundu (Dashboard stats için).`);
  } catch (e) {
    assert(false, "Dashboard operations fetch hatası: " + e.message);
  }

  // 2. Announcements
  try {
    const anns = await supabaseRequest("announcements?select=id,title", "GET");
    assert(anns.status === 200 && Array.isArray(anns.body), "Announcements (Duyurular) tablosundan veri çekilebiliyor.");
    assert(anns.body.length >= 3, `Veritabanında ${anns.body.length} adet duyuru var (En az 3 bekleniyor).`);
  } catch (e) {
    assert(false, "Announcements fetch hatası: " + e.message);
  }

  // 3. Suppliers
  try {
    const sups = await supabaseRequest("suppliers?select=id,name", "GET");
    assert(sups.status === 200 && Array.isArray(sups.body), "Suppliers (Tedarikçiler) tablosundan veri çekilebiliyor.");
    assert(sups.body.length > 0, `Veritabanında ${sups.body.length} adet tedarikçi bulundu.`);
  } catch (e) {
    assert(false, "Suppliers fetch hatası: " + e.message);
  }

  // 4. Facilities
  try {
    const facs = await supabaseRequest("facilities?select=id,name", "GET");
    assert(facs.status === 200 && Array.isArray(facs.body), "Facilities (Tesisler/Raporlar) tablosundan veri çekilebiliyor.");
    assert(facs.body.length > 0, `Veritabanında ${facs.body.length} adet tesis bulundu.`);
  } catch (e) {
    assert(false, "Facilities fetch hatası: " + e.message);
  }

  console.log(`\n📊 Sonuç: ${passed}/${total} Test Başarılı.`);
  if (passed === total) {
    console.log("🎉 Faz 4 entegrasyonu tamamen sağlıklı çalışıyor.");
  } else {
    process.exit(1);
  }
}

testPhase4();
