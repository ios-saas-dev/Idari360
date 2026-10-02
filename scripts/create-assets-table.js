const { Client } = require('pg');

async function createAssetsTable() {
  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  const client = new Client({
    connectionString: `postgres://postgres.mqskcahixsiwiczlqmsx:${encodeURIComponent(dbPassword)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      facility_id UUID REFERENCES public.facilities(id) ON DELETE CASCADE,
      barcode VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      assigned_to VARCHAR(255),
      status VARCHAR(50) DEFAULT 'aktif' CHECK (status IN ('aktif', 'bakimda', 'arizali', 'hurda')),
      purchase_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
    
    DO $$ BEGIN
      CREATE POLICY "assets_select" ON public.assets FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "assets_modify" ON public.assets FOR ALL USING (true);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    INSERT INTO public.assets (barcode, name, category, facility_id, assigned_to, status, purchase_date)
    VALUES
      ('AST-2026-9901', 'Taski Swingo 1650 Binicili Zemin Yıkama Makinesi', 'Temizlik Ekipmanı', 'a0000000-0000-0000-0000-000000000001', 'Temizlik Ekip Lideri', 'aktif', '2024-03-10'),
      ('AST-2026-9902', 'Saladbar Soğutmalı Teşhir Ünitesi (3 Gastronom)', 'Yemekhane', 'a0000000-0000-0000-0000-000000000002', 'Catering Sorumlusu', 'aktif', '2023-08-15'),
      ('AST-2026-9903', 'Jungheinrich EJE 116 Akülü Transpalet', 'Lojistik & Depo', 'a0000000-0000-0000-0000-000000000003', 'Depo Şefi', 'bakimda', '2024-01-20'),
      ('AST-2026-9904', 'Diversey SafePack Otomatik Dozajlama Ünitesi', 'Hijyen', 'a0000000-0000-0000-0000-000000000004', 'İdari İşler Uzmanı', 'aktif', '2024-05-12'),
      ('AST-2026-9905', 'Kärcher B 90 R Binicili Zemin Yıkama', 'Temizlik Ekipmanı', 'a0000000-0000-0000-0000-000000000005', 'Çankaya Tesis Amiri', 'aktif', '2024-02-18')
    ON CONFLICT (barcode) DO NOTHING;
  `;

  await client.query(sql);
  console.log('✅ public.assets tablosu ve başlangıç varlıkları başarıyla kuruldu!');
  await client.end();
}

createAssetsTable().catch(e => console.error(e));
