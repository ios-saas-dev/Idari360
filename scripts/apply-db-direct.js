const { Client } = require("pg");
const fs = require("fs");

const regions = [
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-eu-west-2.pooler.supabase.com"
];

async function tryConnect() {
  for (const host of regions) {
    console.log(`\nDeneme yapılıyor: ${host}`);
    const client = new Client({
      host: host,
      port: 6543,
      database: "postgres",
      user: "postgres.mqskcahixsiwiczlqmsx",
      password: "Ozlemcinar.2026",
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log(`✅ ${host} ÜZERİNDEN BAĞLANDI!`);
      const sql = fs.readFileSync("supabase/migrations/20261002000005_approval_security.sql", "utf8");
      await client.query(sql);
      console.log("✅ SQL BAŞARIYLA UYGULANDI!");
      await client.end();
      return; // Başarılı, çık
    } catch (err) {
      console.error(`❌ Hata (${host}):`, err.message);
    }
  }
}

tryConnect();
