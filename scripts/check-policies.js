const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = URL.replace("https://", "").split(".")[0];

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request(
      {
        hostname: "api.supabase.com", // Try management API again just in case, wait no, Management API failed earlier
        path: `/v1/projects/${PROJECT_REF}/database/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SERVICE_KEY}`, // Note: Management API needs a PAT, not Service Key
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}
