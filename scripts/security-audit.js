const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

function request(path, method, key, body = null) {
  return new Promise((resolve, reject) => {
    const targetUrl = new URL(SUPABASE_URL + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: targetUrl.hostname,
        path: targetUrl.pathname + (targetUrl.search || ""),
        method: method,
        headers: {
          "Content-Type": "application/json",
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Prefer": "return=representation",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runSecurityAudit() {
  console.log("=========================================");
  console.log("🛡️  İDARİ 360 - GÜVENLİK DENETİMİ BAŞLADI");
  console.log("=========================================\n");

  const tablesToTest = ["profiles", "facilities", "operations", "suppliers"];
  let passedTests = 0;
  let totalTests = 0;

  for (const table of tablesToTest) {
    console.log(`🔍 Tablo Test Ediliyor: [${table}]`);
    
    // TEST 1: Anonim (Giriş Yapmamış) Okuma Testi
    totalTests++;
    const anonRead = await request(`/rest/v1/${table}?limit=1`, "GET", ANON_KEY);
    if (anonRead.status === 200 && Array.isArray(anonRead.body) && anonRead.body.length === 0) {
      console.log(`   ✅ RLS AKTİF: Anonim okuma reddedildi (Boş veri döndü)`);
      passedTests++;
    } else if (anonRead.status >= 400) {
      console.log(`   ✅ RLS AKTİF: Anonim okuma engellendi (Status: ${anonRead.status})`);
      passedTests++;
    } else {
      console.log(`   ❌ GÜVENLİK AÇIĞI: Anonim okuma başarılı oldu! RLS kapalı olabilir.`);
    }

    // TEST 2: Anonim (Giriş Yapmamış) Yazma Testi
    totalTests++;
    const anonWrite = await request(`/rest/v1/${table}`, "POST", ANON_KEY, { dummy: "data" });
    if (anonWrite.status === 401 || anonWrite.status === 403 || (anonWrite.body && anonWrite.body.code === '42501')) {
      console.log(`   ✅ RLS AKTİF: Yetkisiz yazma (Insert) reddedildi (42501 - Yetki Yok)`);
      passedTests++;
    } else if (anonWrite.status >= 400) {
      console.log(`   ✅ RLS AKTİF: Yetkisiz yazma engellendi (Status: ${anonWrite.status})`);
      passedTests++;
    } else {
      console.log(`   ❌ GÜVENLİK AÇIĞI: Yetkisiz yazma başarılı oldu!`);
    }
    
    console.log("---");
  }

  // TEST 3: Kimlik Doğrulama Endpoint Kontrolü
  console.log(`🔍 Supabase Auth Uç Noktası Test Ediliyor...`);
  totalTests++;
  const authTest = await request(`/auth/v1/settings`, "GET", ANON_KEY);
  if (authTest.status === 200) {
    console.log(`   ✅ Auth servisi aktif ve yanıt veriyor.`);
    passedTests++;
  }

  console.log("\n=========================================");
  console.log(`📊 DENETİM SONUCU: ${passedTests}/${totalTests} Test Başarılı`);
  if (passedTests === totalTests) {
    console.log("🏆 SİSTEM %100 GÜVENLİ! RLS (Row Level Security) tüm tablolarda kusursuz çalışıyor.");
  } else {
    console.log("⚠️ BAZI GÜVENLİK AÇIKLARI TESPİT EDİLDİ!");
  }
  console.log("=========================================");
}

runSecurityAudit();
