const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const regions = [
  'eu-central-1', // Frankfurt (En popüler TR)
  'eu-west-1',    // Ireland
  'eu-west-2',    // London
  'eu-west-3',    // Paris
  'eu-north-1',   // Stockholm
  'us-east-1',    // N. Virginia
  'us-east-2',    // Ohio
  'us-west-1',    // N. California
  'us-west-2',    // Oregon
  'ap-southeast-1', // Singapore
  'ap-southeast-2', // Sydney
  'ap-northeast-1', // Tokyo
  'ap-south-1',     // Mumbai
  'sa-east-1',      // Sao Paulo
  'me-central-1'    // Middle East
];

async function main() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  if (!dbPassword) {
    console.error('Lütfen veritabanı şifresini parametre veya SUPABASE_DB_PASSWORD olarak iletin.');
    process.exit(1);
  }
  const projectRef = 'mqskcahixsiwiczlqmsx';
  const sqlPath = path.join(__dirname, '..', 'supabase', 'COMPLETE_DATABASE_SETUP.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Supabase veritabanı bölgesi taranıyor...');

  for (const reg of regions) {
    const connStr = `postgres://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@aws-0-${reg}.pooler.supabase.com:6543/postgres`;
    process.stdout.write(`Bölge deneniyor: ${reg}... `);

    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 4000
    });

    try {
      await client.connect();
      console.log('\n======================================================');
      console.log(`🎉 BAĞLANTI BAŞARILI! Bölge: ${reg}`);
      console.log('Veritabanı tabloları, RLS ve Excel denetim verileri yükleniyor...');
      await client.query(sql);
      console.log('✅ TÜM TABLOLAR VE RLS POLİTİKALARI EKSİKSİZ KURULDU!');
      console.log('======================================================');
      await client.end();
      process.exit(0);
    } catch (err) {
      if (err.message.includes('password authentication failed')) {
        console.log(`\n❌ Bölge bulundu (${reg}) ancak şifre uyuşmadı:`, err.message);
        await client.end().catch(() => {});
        process.exit(1);
      } else {
        console.log('bulunamadı.');
        await client.end().catch(() => {});
      }
    }
  }

  console.log('Hiçbir pooler bölgesinde bulunamadı.');
}

main();
