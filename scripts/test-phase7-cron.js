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

function supabaseRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ""),
        method: method,
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Prefer": "return=representation",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function fetchCron(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: "GET",
        headers: {
          "Authorization": `Bearer idari360_secure_cron_token_2026`
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function runTest() {
  console.log("🚀 Faz 7 (Otomasyon & Bildirimler) Testi Başlıyor...");

  // 1. Tesis ve profil var mı kontrol et
  const facs = await supabaseRequest("facilities?select=id&limit=1");
  let profiles = await supabaseRequest("profiles?select=id,email&limit=1");
  
  if (facs.body.length === 0) {
    console.error("Test verisi eksik (facility yok).");
    return;
  }
  
  if (profiles.body.length === 0) {
    console.log("Profiles boş, admin user ekleniyor...");
    // Just mock one profile for tests
    const pRes = await supabaseRequest("profiles", "POST", {
       id: "10000000-0000-0000-0000-000000000000",
       email: "admin@idari360.com",
       full_name: "Test Admin",
       role: "facility_admin",
       is_active: true,
       facility_id: facs.body[0].id
    });
    profiles = await supabaseRequest("profiles?select=id,email&limit=1");
  }

  // 2. 2 gün sonrasına deadline'ı olan örnek bir operasyon ekle
  const now = new Date();
  const deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
  
  const mockOp = {
    operation_number: "OP-TEST-" + Math.floor(Math.random() * 10000),
    title: "Test: 2 Gün Kalmış Operasyon",
    description: "Faz 7 deadline cron testi.",
    category: "temizlik",
    priority: "yuksek",
    status: "devam_ediyor",
    facility_id: facs.body[0].id,
    created_by: profiles.body[0].id,
    assigned_to: profiles.body[0].id,
    deadline: deadline
  };

  const insertRes = await supabaseRequest("operations", "POST", mockOp);
  console.log(`✅ Test operasyonu eklendi: ${mockOp.operation_number}`);

  // 3. Cron'u tetikle (Yerel sunucumuz :3000 üzerinden)
  console.log(`⏳ /api/cron/deadline-notifications çalıştırılıyor...`);
  try {
    const cronRes = await fetchCron("/api/cron/deadline-notifications");
    console.log("✅ Cron Yanıtı:", cronRes.body);
    
    if (cronRes.body.success && cronRes.body.notificationsSent > 0) {
      console.log("🎉 Faz 7 Testi BAŞARILI! E-postalar ve uygulama içi bildirimler tetiklendi.");
    } else {
      console.log("⚠️ Beklenen bildirim tetiklenmedi. Sonuç:", cronRes.body);
    }
  } catch (err) {
    console.error("❌ Cron tetiklenemedi. Next.js sunucusu (npm run dev) çalışmıyor olabilir.", err);
  }

  // 4. Test operasyonunu temizle
  if (insertRes.body && insertRes.body[0]) {
    await supabaseRequest(`operations?id=eq.${insertRes.body[0].id}`, "DELETE");
    console.log(`🧹 Test operasyonu silindi.`);
  }
}

runTest();
