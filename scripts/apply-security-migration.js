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
const PROJECT_REF = SUPABASE_URL.replace("https://", "").split(".")[0];

function restRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ""),
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
          } catch {
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

// Supabase'de DDL çalıştırmak için: pg_dump ya da RPC yaklaşımı yok,
// bunun yerine Supabase'in /sql endpoint'ini kullanacağız.
// Bu: POST https://PROJECT.supabase.co/pg/query (Supabase Studio API)
function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request(
      {
        hostname: `${PROJECT_REF}.supabase.co`,
        path: `/pg/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: data ? JSON.parse(data) : data });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function checkCurrentSchema() {
  console.log("🔍 Mevcut profiles şeması kontrol ediliyor (REST)...");
  
  // REST ile profiles tablosundan bir örnek çek - bu sütun listesini gösterir
  const res = await restRequest("/rest/v1/profiles?limit=0&select=*", "GET");
  console.log("Profiles columns check status:", res.status);
  
  // pg/query endpoint dene
  console.log("\n🔍 pg/query endpoint deneniyor...");
  const sqlRes = await runSQL("SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;");
  console.log("SQL endpoint status:", sqlRes.status);
  console.log("Response:", JSON.stringify(sqlRes.body).substring(0, 300));
}

checkCurrentSchema();
