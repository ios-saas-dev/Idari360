const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

function supabaseRequest(path) {
  return new Promise((resolve) => {
    const url = new URL(env.NEXT_PUBLIC_SUPABASE_URL + "/rest/v1/" + path);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + (url.search || ""),
        method: "GET",
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(JSON.parse(data)));
      }
    );
    req.end();
  });
}

async function main() {
  const sups = await supabaseRequest("suppliers?select=*");
  console.log(sups);
}
main();
