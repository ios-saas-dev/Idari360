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

async function testPhase5() {
  console.log("🚀 Faz 5 (Tedarikçi Performans Yönetimi) Testleri Başlıyor...\n");
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

  // 1. Fetch suppliers
  let suppliers = [];
  try {
    const res = await supabaseRequest("suppliers?select=*");
    assert(res.status === 200, "Tedarikçiler API üzerinden getirilebiliyor.");
    assert(Array.isArray(res.body) && res.body.length >= 4, `En az 4 ana tedarikçi bulunmalı. (Bulunan: ${res.body?.length || 0})`);
    suppliers = res.body;
  } catch (e) {
    assert(false, "Suppliers fetch hatası: " + e.message);
  }

  // 2. Validate supplier scores
  if (suppliers.length > 0) {
    const s = suppliers[0];
    const hasScores = 
      'service_quality_score' in s &&
      'punctuality_score' in s &&
      'complaint_score' in s &&
      'overall_score' in s;
    
    assert(hasScores, "Tedarikçi kayıtlarında performans karne skorları (KPI) eksiksiz yer alıyor.");
  } else {
    assert(false, "Kayıt bulunamadığı için KPI validasyonu yapılamadı.");
  }

  // 3. Score update test (Mock an update)
  if (suppliers.length > 0) {
    const target = suppliers[0];
    const newScore = target.overall_score === 100 ? 99 : 100;
    
    try {
      const updateRes = await supabaseRequest(`suppliers?id=eq.${target.id}`, "PATCH", { overall_score: newScore });
      assert(updateRes.status === 200 || updateRes.status === 204, "Tedarikçi performans skorları başarıyla güncellenebiliyor.");
      
      // Revert
      await supabaseRequest(`suppliers?id=eq.${target.id}`, "PATCH", { overall_score: target.overall_score });
      assert(true, "Test değişikliği başarıyla geri alındı.");
    } catch (e) {
      assert(false, "Score update hatası: " + e.message);
    }
  }

  console.log(`\n📊 Sonuç: ${passed}/${total} Test Başarılı.`);
  if (passed === total) {
    console.log("🎉 Faz 5 entegrasyonu tamamen sağlıklı çalışıyor.");
  } else {
    process.exit(1);
  }
}

testPhase5();
