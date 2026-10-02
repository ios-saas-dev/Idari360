const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqskcahixsiwiczlqmsx.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const foodQuestions = [
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'El yıkama lavaboları fiziksel özellikleri uygun mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'El yıkama lavaboları ulaşılabilir, kullanıma uygun durumda mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'El yıkama dışında herhangi başka bir amaç için kullanılmıyor mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Üretim boyunca sıcak (ılık) su sağlanıyor mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'El yıkama talimatları mevcut mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Antibakteriyel sabun, el dezenfektanı, kağıt havlu temiz ve kullanılabilir durumda mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'El yıkama lavaboları yanında sadece pedallı çöp kovası mevcut mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Tüm personel gıda maddeleri ile temas etmeden önce ellerini yıkıyor mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Gerekli durumlarda talimatlara uygun eldiven kullanılıyor mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Sebze-Meyve Dezenfeksiyonu talimata uygun mu?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Tüm kritik limitler ile ilgili çalışanlar yeterli bilgiye sahip mi?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Gıda ürünlerinin tüm hazırlık aşamalarında çapraz kontaminasyona karşı önlem alınmış mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Ortamda üzeri açık gıda maddesi var mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Direkt yere bırakılmış ürün, ekipman vb. var mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Temiz ve kirli bölümler tanımlanmış mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Ürün grup ve risklerine göre renk koduna göre tezgah/bıçak ayrımı yapılmış mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Üretim alanında atık ve yabancı malzeme var mı?', points: 2 },
  { section: 'Hazırlık, Pişirme ve Sevkiyat', text: 'Üretim alanında cam malzeme ve cam ambalaj var mı?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Servis personelinin kıyafeti, davranışları hijyen kurallarına uygun mu?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Servis bölümünün genel temizlik ve düzeni uygun mu?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Servis ekipmanları temiz mi?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Servis alanındaki tüm ekipmanlar kullanılabilir durumda mı?', points: 1 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Alanda alerjen afişleri mevcut mu?', points: 1 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Yemeklere yakın yerlerde besin etiketleri, alerjen tablosu mevcut mu?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Yemek salonu tertip ve düzeni talimatlara uygun mu?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Yemek salonu temiz ve düzenli mi? (masa, sandalye vb.)', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Su sebilleri paslı değil ve temiz mi?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Saladbar, sos masaları, ekmek dolabı temiz ve düzenli mi?', points: 2 },
  { section: 'Servis Alanı ve Yemek Salonu', text: 'Cam, yer, kalorifer petekleri, duvar temizliği uygun mu?', points: 2 },
  { section: 'Bina, Alet ve Ekipmanlar', text: 'Alet ve Ekipmanlar uygun ve temiz mi?', points: 2 },
  { section: 'Bina, Alet ve Ekipmanlar', text: 'Yer, raf, duvar, tavan, mazgal, dolap, kapı temizlikleri uygun mu?', points: 2 },
  { section: 'Sanitasyon', text: 'Temizlik planları ve MSDS bilgileri mevcut mu?', points: 3 },
  { section: 'Sanitasyon', text: 'Bulaşık makinasında son durulama suyu sıcaklığı 75°C ve üzerinde mi?', points: 3 },
  { section: 'Soyunma Odaları', text: 'Soyunma odaları genel hijyen ve düzenleri uygun mu?', points: 2 }
];

const cleaningQuestions = [
  { section: 'Operasyon Alanı', text: 'Streç ve karton atıkları toplanmış mı / toplanıyor mu?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Binicili makina ile yıkama yapılıyor mu?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Operasyon alanında yıkama araçlarına ait kullanma talimatları mevcut mu?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Operasyon alanında bulunan temizlik ekipmanları düzenli ve tanımlı yerlerde mi?', points: 2 },
  { section: 'Operasyon Alanı', text: 'Temizlik ekipmanlarının fiziki ve temizlik şartları uygun mu?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Zeminlerde ve yüzeylerde toz, kir mevcut mu?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Rampa kapıları, kapı kumandaları ve aydınlatmalar temiz mi?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Spiraller ve sorter temiz mi?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Merdiven korkulukları temiz mi?', points: 3 },
  { section: 'Operasyon Alanı', text: 'Yüksek alan yangın boruları ve doğalgaz radyantları temiz mi?', points: 5 },
  { section: 'WC ve Soyunma Odaları', text: 'Temizlik talimatlarında tanımlanmış bez ve kimyasallar ile temizlik yapılıyor mu?', points: 3 },
  { section: 'WC ve Soyunma Odaları', text: 'Çöpler alınmış ve temiz mi?', points: 3 },
  { section: 'WC ve Soyunma Odaları', text: 'Tuvalet ekipmanları (sifon, sabun ve su armatürleri, kilit) çalışır durumda mı?', points: 3 },
  { section: 'Ortak ve Mola Alanları', text: 'Masalar ve oturaklar temiz mi?', points: 3 },
  { section: 'Ortak ve Mola Alanları', text: 'Çay alanı sarf malzeme tam, temiz ve çay demlenmiş mi?', points: 6 },
  { section: 'Ofis Alanları', text: 'Ofis mutfak alanı ve zeminler temiz mi?', points: 6 },
  { section: 'Ofis Alanları', text: 'Toplantı odaları camları ve masalar temiz mi?', points: 6 },
  { section: 'Ofis Alanları', text: 'Ofis WCler temiz ve düzenli mi?', points: 6 }
];

async function seed() {
  console.log('Yemekhane soruları ekleniyor...');
  const foodInserts = foodQuestions.map((q, idx) => ({
    template_id: 'b0000000-0000-0000-0000-000000000002',
    category_section: q.section,
    question_text: q.text,
    points: q.points,
    sort_order: idx + 1
  }));
  await supabase.from('audit_questions').insert(foodInserts);

  console.log('Temizlik soruları ekleniyor...');
  const cleaningInserts = cleaningQuestions.map((q, idx) => ({
    template_id: 'b0000000-0000-0000-0000-000000000003',
    category_section: q.section,
    question_text: q.text,
    points: q.points,
    sort_order: idx + 1
  }));
  await supabase.from('audit_questions').insert(cleaningInserts);

  const { data: total } = await supabase.from('audit_questions').select('count');
  console.log('✅ Toplam Denetim Sorusu Sayısı:', total);
}

seed();
