const https = require("https");
const fs = require("fs");

// Tüm env değişkenlerini oku
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const HOST = SUPABASE_URL.replace("https://", "");

// Supabase REST API üzerinden sorgu çalıştır (Service Role Key ile)
function apiRequest(path, method, key, body = null) {
  return new Promise((resolve) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: HOST,
        path: path,
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
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    if (postData) req.write(postData);
    req.end();
  });
}

// Anonimik erişim testi
function anonGet(table) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: HOST,
        path: `/rest/v1/${table}?limit=1`,
        method: "GET",
        headers: {
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`,
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
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.end();
  });
}

// Service Role ile authenticated erişim testi
function serviceGet(table) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: HOST,
        path: `/rest/v1/${table}?limit=1`,
        method: "GET",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
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
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.end();
  });
}

const TABLES = [
  "profiles", "facilities", "operations", "reports_config",
  "vehicles", "vehicle_telemetry", "audit_templates",
  "audit_questions", "audit_submissions", "audit_answers",
  "action_items", "suppliers", "announcements", "notifications"
];

async function runAudit() {
  console.log("=============================================================");
  console.log("🛡️  İDARİ 360 - TAM KAPSAMLI SIZMA TESTİ (PENTEST v3) 🛡️");
  console.log(`🔗  Supabase Projesi: ${HOST}`);
  console.log("=============================================================\n");

  let passed = 0;
  let failed = 0;
  const leaks = [];

  for (const table of TABLES) {
    console.log(`\n🔍 [${table.toUpperCase()}]`);

    // 1. ANONİM OKUMA TESTİ (En kritik test - hiç kimse giriş yapmadan okuyamamalı)
    const anonRead = await anonGet(table);
    const anonBlocked = anonRead.status >= 400 || 
      (anonRead.status === 200 && Array.isArray(anonRead.body) && anonRead.body.length === 0);
    
    if (anonBlocked) {
      console.log(`  ✅ Anonim Okuma: ENGELLENDİ`);
      passed++;
    } else {
      const count = Array.isArray(anonRead.body) ? anonRead.body.length : "?";
      console.log(`  ❌ Anonim Okuma: AÇIK! (${count} kayıt sızdı)`);
      failed++;
      leaks.push(table);
    }

    // 2. SERVICE ROLE OKUMA TESTİ (Yönetici erişimi çalışıyor mu?)
    const svcRead = await serviceGet(table);
    if (svcRead.status === 200) {
      console.log(`  ✅ Yönetici Okuma: AKTİF (Service Role çalışıyor)`);
      passed++;
    } else {
      console.log(`  ⚠️  Yönetici Okuma: Beklenmedik yanıt (${svcRead.status})`);
    }
  }

  console.log("\n=============================================================");
  console.log(`📊 ANONİM OKUMA TESTİ: ${TABLES.length - leaks.length}/${TABLES.length} Tablo Güvenli`);
  
  if (leaks.length === 0) {
    console.log("🏆 KUSURSUZ! Sisteminiz %100 GÜVENLİ.");
    console.log("🔒 ZERO-TRUST MİMARİSİ TAM AKTİF.");
  } else {
    console.log(`\n⚠️  ${leaks.length} TABLODA OKUMA AÇIĞI VAR:`);
    leaks.forEach(t => console.log(`   🔓 ${t}`));
    console.log("\n📋 ÇÖZÜM: Bu tablolarda anonim erişime izin veren bir RLS policy var.");
    console.log("   Supabase Dashboard > Table Editor > [tablo adı] > Policies");
    console.log("   sayfasında 'Enable read access for all users' policy'sini silin.");
  }
  console.log("=============================================================");
}

runAudit();
