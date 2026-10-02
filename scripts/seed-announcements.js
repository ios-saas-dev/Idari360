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

function supabaseRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + "/rest/v1/" + path);
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
          "Prefer": "return=minimal",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
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

// SQL sorgusu çalıştırmak için (Supabase postgres rest endpointi var mı? Yoksa REST post)
// Ama CREATE TABLE rest üzerinden yapılamaz.
// Table'i UI'dan oluşturdunuz mu veya migrations'la mı?
// Eğer tablo yoksa hata alır. Bir tablo kontrolü yapalım.

async function main() {
  console.log("🔗 Supabase'e service_role ile bağlanılıyor (Announcements)...");
  
  // Sadece eklemeyi deneyelim. Eğer tablo yoksa 404/401 döner.
  // Tablo varsa, zaten çalışır.
  const check = await supabaseRequest("announcements?select=id&limit=1", "GET");
  if (check.status === 404) {
    console.error("❌ 'announcements' tablosu yok! Supabase SQL Editor'den oluşturun.");
    process.exit(1);
  }

  if (check.status === 200 && Array.isArray(check.body) && check.body.length > 0) {
    console.log("ℹ️  Duyurular zaten mevcut, seed atlanıyor.");
    return;
  }

  const mockData = [
    { title: "Bayram Tatili Duyurusu", content: "Kurban Bayramı tatili 6-9 Haziran tarihleri arasındadır. Nöbetçi personel listesi belirlenmiştir.", date: "30.05.2026" },
    { title: "Yemekhane Çalışma Saatleri", content: "1 Haziran itibarıyla yemekhane saatlerinde değişiklik olacaktır. Öğle servisi 12:00-14:00 saatleri arasındadır.", date: "28.05.2026" },
    { title: "Servis Güzergah Güncellemesi", content: "Bazı servis güzergahlarında güncelleme yapılmıştır. Yeni rota detaylarını Servis sekmesinden inceleyebilirsiniz.", date: "27.05.2026" }
  ];

  for (const ann of mockData) {
    const res = await supabaseRequest("announcements", "POST", ann);
    if (res.status === 201 || res.status === 200) {
      console.log(`  ✅ ${ann.title}`);
    } else {
      console.log(`  ⚠️  ${ann.title} eklenemedi (status ${res.status}):`, res.body);
    }
  }
}

main().catch(console.error);
