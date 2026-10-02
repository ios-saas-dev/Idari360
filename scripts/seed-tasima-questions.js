const xlsx = require('xlsx');
const { Client } = require('pg');
const fs = require('fs');

async function seedTasima() {
  const wb = xlsx.readFile('C:/Users/ozlem/.gemini/antigravity/brain/8859891a-945e-457f-acdd-b7dd386aa3a5/.user_uploaded/media_1790903069467.xlsx');
  const sheet = wb.Sheets['Yemekhane Taşıma '];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const templateId = 'b0000000-0000-0000-0000-000000000004';
  let currentSection = 'Servis Alanı ve Yemek Salonu';
  const questionsToInsert = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row['Konu Başlığı']) {
      currentSection = row['Konu Başlığı'];
    }

    const questionText = row['Uygulama Denetim Soruları'];
    const points = Number(row['Puan'] || 3);

    if (questionText && questionText.trim().length > 5) {
      questionsToInsert.push({
        template_id: templateId,
        category_section: currentSection,
        question_text: questionText.trim(),
        points: points || 3,
        sort_order: questionsToInsert.length + 1,
      });
    }
  }

  console.log(`Extracted ${questionsToInsert.length} questions for Yemekhane Taşıma.`);

  const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
  const client = new Client({
    connectionString: `postgres://postgres.mqskcahixsiwiczlqmsx:${encodeURIComponent(dbPassword)}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  await client.query(`DELETE FROM public.audit_questions WHERE template_id = $1`, [templateId]);

  for (const q of questionsToInsert) {
    await client.query(
      `INSERT INTO public.audit_questions (template_id, category_section, question_text, points, sort_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [q.template_id, q.category_section, q.question_text, q.points, q.sort_order]
    );
  }

  console.log(`✅ ${questionsToInsert.length} soruları başarıyla PostgreSQL'e aktarıldı!`);
  await client.end();
}

seedTasima().catch(console.error);
