const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const supabase = createClient(url, key);

async function runTestSuite() {
  console.log('========================================================');
  console.log('🚀 FAZ 2 CANLI VERİTABANI VE MODÜL TEST SUITE BAŞLADI');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Şubeler 360° Karnesi
  try {
    const { data: facilities, error: fErr } = await supabase.from('facilities').select('*').order('code');
    if (fErr) throw fErr;
    if (!facilities || facilities.length === 0) throw new Error('Şube bulunamadı.');

    const target = facilities[0];
    const newCleanliness = 93.5;
    const { data: updated, error: uErr } = await supabase
      .from('facilities')
      .update({ cleanliness_score: newCleanliness })
      .eq('id', target.id)
      .select()
      .single();
    if (uErr) throw uErr;

    console.log(`✅ TEST 1 BAŞARILI: Şubeler 360° (ID: ${target.id}, Temizlik Skoru ${target.cleanliness_score} -> ${updated.cleanliness_score} güncellendi)`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 1 BAŞARISIZ (Şubeler 360):', err.message);
    failed++;
  }

  // TEST 2: Varlık Yönetimi & QR Kod
  let testAssetId = null;
  try {
    const barcode = `TEST-AST-${Date.now()}`;
    const { data: facilities } = await supabase.from('facilities').select('id').limit(1);
    const facilityId = facilities[0].id;

    const { data: asset, error: aErr } = await supabase
      .from('assets')
      .insert([
        {
          barcode,
          name: 'Test Temizlik Makinesi Taski 1200',
          category: 'Temizlik Ekipmanı',
          facility_id: facilityId,
          assigned_to: 'Test Operatörü',
          status: 'aktif',
          purchase_date: '2026-06-01'
        }
      ])
      .select('*, facilities(name, code)')
      .single();

    if (aErr) throw aErr;
    testAssetId = asset.id;
    console.log(`✅ TEST 2 BAŞARILI: Varlık Yönetimi (Kayıt ID: ${asset.id}, Barkod: ${asset.barcode}, Tesis: ${asset.facilities.name})`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 2 BAŞARISIZ (Varlık):', err.message);
    failed++;
  } finally {
    if (testAssetId) {
      await supabase.from('assets').delete().eq('id', testAssetId);
    }
  }

  // TEST 3: Servis & Canlı GPS Telemetri
  let testVehId = null;
  try {
    const testPlate = `34 TST ${Math.floor(100 + Math.random() * 900)}`;
    const { data: veh, error: vErr } = await supabase
      .from('vehicles')
      .insert([
        {
          plate: testPlate,
          vehicle_type: 'servis',
          brand: 'Mercedes-Benz',
          model: 'Sprinter 16+1',
          model_year: 2024,
          driver_name: 'Test Sürücü',
          capacity: 16,
          passenger_count: 12,
          current_lat: 41.0150,
          current_lng: 28.9790,
          interior_temp: 22.0,
          ac_status: true,
          cleanliness_score: 95.0
        }
      ])
      .select()
      .single();

    if (vErr) throw vErr;
    testVehId = veh.id;

    // Telemetri güncelleme testi (sıcaklık & klima)
    const { data: updatedVeh, error: tErr } = await supabase
      .from('vehicles')
      .update({ interior_temp: 21.5, ac_status: false })
      .eq('id', testVehId)
      .select()
      .single();

    if (tErr) throw tErr;

    console.log(`✅ TEST 3 BAŞARILI: Servis & Telemetri (Plaka: ${veh.plate}, İç Sıcaklık: ${updatedVeh.interior_temp}°C, Klima: ${updatedVeh.ac_status})`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 3 BAŞARISIZ (Servis Telemetri):', err.message);
    failed++;
  } finally {
    if (testVehId) {
      await supabase.from('vehicles').delete().eq('id', testVehId);
    }
  }

  // TEST 4: Filo Yönetimi
  try {
    const { data: fleetVehicles, error: fvErr } = await supabase.from('vehicles').select('*');
    if (fvErr) throw fvErr;
    console.log(`✅ TEST 4 BAŞARILI: Filo Yönetimi (${fleetVehicles.length} adet kayıtlı şirket aracı doğrulandı)`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 4 BAŞARISIZ (Filo):', err.message);
    failed++;
  }

  // TEST 5: Yemekhane Süreç & HACCP Denetim Soruları
  try {
    const { data: suppliers, error: sErr } = await supabase.from('suppliers').select('*').eq('category', 'Yemekhane');
    if (sErr) throw sErr;

    const { data: yerindeQuestions, error: yErr } = await supabase
      .from('audit_questions')
      .select('*')
      .eq('template_id', 'b0000000-0000-0000-0000-000000000002');
    if (yErr) throw yErr;

    const { data: tasimaQuestions, error: tErr } = await supabase
      .from('audit_questions')
      .select('*')
      .eq('template_id', 'b0000000-0000-0000-0000-000000000004');
    if (tErr) throw tErr;

    console.log(`✅ TEST 5 BAŞARILI: Yemekhane Modülü (Tedarikçi: ${suppliers[0].name}, Yerinde Üretim: ${yerindeQuestions.length} soru, Taşıma: ${tasimaQuestions.length} soru)`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 5 BAŞARISIZ (Yemekhane):', err.message);
    failed++;
  }

  // TEST 6: Temizlik ATS & Geri Dönüşüm Kantar Takibi
  let testWasteId = null;
  try {
    const { data: facilities } = await supabase.from('facilities').select('id').limit(1);
    const facilityId = facilities[0].id;

    const { data: wasteLog, error: wErr } = await supabase
      .from('waste_logs')
      .insert([
        {
          facility_id: facilityId,
          cardboard_kg: 500,
          plastic_nylon_kg: 150,
          container_code: 'KNT-TEST-01',
          scale_operator: 'Test Kantarcı'
        }
      ])
      .select()
      .single();

    if (wErr) throw wErr;
    testWasteId = wasteLog.id;

    console.log(`✅ TEST 6 BAŞARILI: Akıllı Atık & Kantar (Karton: ${wasteLog.cardboard_kg} kg, Naylon: ${wasteLog.plastic_nylon_kg} kg, Tahmini Gelir: ₺${wasteLog.calculated_revenue})`);
    passed++;
  } catch (err) {
    console.error('❌ TEST 6 BAŞARISIZ (Temizlik / Atık):', err.message);
    failed++;
  } finally {
    if (testWasteId) {
      await supabase.from('waste_logs').delete().eq('id', testWasteId);
    }
  }

  console.log('\n========================================================');
  console.log(`🏁 TÜM FAZ 2 TESTLERİ TAMAMLANDI: ${passed} Başarılı, ${failed} Hata`);
  console.log('========================================================');
}

runTestSuite().catch(console.error);
