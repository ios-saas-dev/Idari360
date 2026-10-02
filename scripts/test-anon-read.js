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

function request(path) {
  return new Promise((resolve) => {
    const targetUrl = new URL(SUPABASE_URL + path);
    const req = https.request(
      {
        hostname: targetUrl.hostname,
        path: targetUrl.pathname + targetUrl.search,
        method: "GET",
        headers: {
          "apikey": ANON_KEY,
          "Authorization": `Bearer ${ANON_KEY}`,
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

async function test() {
  const res = await request("/rest/v1/facilities?limit=1");
  console.log("Status:", res.status);
  console.log("Body:", res.body);
}

test();
