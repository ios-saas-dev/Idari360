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

function request(path, method, body = null) {
  return new Promise((resolve) => {
    const targetUrl = new URL(SUPABASE_URL + path);
    const postData = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: targetUrl.hostname,
        path: targetUrl.pathname + targetUrl.search,
        method: method,
        headers: {
          "Content-Type": "application/json",
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`,
          "Prefer": "return=representation",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.end();
  });
}

async function testRlsIsActuallyOn() {
  // Test with valid data to bypass NOT NULL constraints
  const writeRes = await request("/rest/v1/facilities", "POST", {
    code: "HACK-001",
    name: "Hacked Facility",
    monthly_cost: 0
  });
  console.log("Write response status:", writeRes.status);
  console.log("Write response body:", writeRes.body);
}

testRlsIsActuallyOn();
