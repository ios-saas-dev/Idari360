const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const PAT = env.SUPABASE_PAT;
const PROJECT_REF = env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "").split(".")[0];

const req = https.request(
  {
    hostname: "api.supabase.com",
    path: `/v1/projects/${PROJECT_REF}/config/auth`,
    method: "GET",
    headers: { "Authorization": `Bearer ${PAT}` },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => console.log(data));
  }
);
req.on("error", console.error);
req.end();
