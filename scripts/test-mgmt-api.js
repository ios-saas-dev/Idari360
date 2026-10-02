const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];
const HOST = SUPABASE_URL.replace("https://", "");

// Supabase Management API ile SQL çalıştır
function runSQLViaManagementAPI(sql, token) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${PROJECT_REF}/database/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.write(postData);
    req.end();
  });
}

// Anonim okuma testi
function testAnonRead(table) {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: HOST,
        path: `/rest/v1/${table}?limit=1`,
        method: "GET",
        headers: {
          "apikey": env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const body = JSON.parse(data);
            resolve({ status: res.status || res.statusCode, body });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.end();
  });
}

// Management API üzerinden RPC çağır (pg_advisory_lock trick ile SQL)
function callRPC(funcName, params, key) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(params);
    const req = https.request(
      {
        hostname: HOST,
        path: `/rest/v1/rpc/${funcName}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("🔗 Supabase Management API Test Ediliyor...");
  console.log(`   Project Ref: ${PROJECT_REF}`);
  console.log(`   Service Key (ilk 20 char): ${SERVICE_KEY.substring(0, 20)}...\n`);

  // Test 1: Management API ile basit sorgu dene
  const testSQL = "SELECT current_user, version();";
  const mgmtResult = await runSQLViaManagementAPI(testSQL, SERVICE_KEY);
  console.log(`Management API Status: ${mgmtResult.status}`);
  console.log(`Management API Response: ${mgmtResult.body.substring(0, 200)}`);

  if (mgmtResult.status === 200) {
    console.log("\n✅ Management API ÇALIŞIYOR! SQL çalıştırılıyor...");
    // Güvenlik SQL'ini çalıştır
    const securitySQL = fs.readFileSync("supabase/migrations/20261002000006_full_security_hardening.sql", "utf8");
    const fixResult = await runSQLViaManagementAPI(securitySQL, SERVICE_KEY);
    console.log(`Security Fix Status: ${fixResult.status}`);
    console.log(`Security Fix Response: ${fixResult.body.substring(0, 500)}`);
  } else {
    console.log("\n❌ Management API çalışmıyor (PAT gerekli).");
    console.log("   Çözüm: Supabase Dashboard > Account > Access Tokens > Generate new token");
    console.log("   Oluşturulan token'ı .env.local'a SUPABASE_PAT=sbp_... şeklinde ekleyin");
  }
}

main();
