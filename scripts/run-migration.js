const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];

  if (!dbPassword) {
    console.error('Lütfen veritabanı şifrenizi argüman olarak verin: node scripts/run-migration.js <ŞİFRENİZ>');
    process.exit(1);
  }

  const projectRef = 'mqskcahixsiwiczlqmsx';
  
  // Try direct connection or transaction pooler
  const connectionStrings = [
    `postgres://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
    `postgres://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
    `postgres://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`
  ];

  const sqlPath = path.join(__dirname, '..', 'supabase', 'COMPLETE_DATABASE_SETUP.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  let connected = false;

  for (const connStr of connectionStrings) {
    console.log('Bağlantı deneniyor...');
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log('✅ PostgreSQL Veritabanına Başarıyla Bağlanıldı!');
      console.log('SQL Migration ve RLS Kurulumu Başlatılıyor...');
      await client.query(sql);
      console.log('🎉 TÜM TABLOLAR, RLS POLİTİKALARI VE SEED VERİLERİ BAŞARIYLA OLUŞTURULDU!');
      await client.end();
      connected = true;
      break;
    } catch (err) {
      console.warn('Bu host üzerinden bağlantı sağlanamadı:', err.message);
      await client.end().catch(() => {});
    }
  }

  if (!connected) {
    console.error('Bağlantı kurulamadı. Lütfen şifrenizi ve bölgenizi kontrol edin.');
  }
}

run();
