-- ============================================================================
-- İDARİ 360 SEED DATA (Facilities, Audit Questions, Vehicles, Suppliers)
-- ============================================================================

-- 1. FACILITIES (Örnek Şubeler)
INSERT INTO facilities (id, code, name, city, address, phone, health_status, satisfaction_score, cleanliness_score, pest_control_score, waternet_score, monthly_cost)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'SUB-001', 'Agora Şubesi', 'İzmir', 'Mithatpaşa Cad. No:142 Balçova', '0232 277 00 00', 'good', 4.60, 92.5, 96.0, 90.0, 48500.00),
  ('a0000000-0000-0000-0000-000000000002', 'SUB-002', 'Maslak Genel Merkez', 'İstanbul', 'Büyükdere Cad. No:245 Maslak', '0212 335 00 00', 'good', 4.85, 96.0, 98.0, 94.0, 112000.00),
  ('a0000000-0000-0000-0000-000000000003', 'SUB-003', 'Kadıköy Lojistik Merkezi', 'İstanbul', 'E-5 Yan Yol No:12 Kozyatağı', '0216 410 00 00', 'warning', 3.90, 78.0, 85.0, 79.0, 64000.00),
  ('a0000000-0000-0000-0000-000000000004', 'SUB-004', 'Bornova Depo & Dağıtım', 'İzmir', 'Sanayi Cad. No:88 Bornova', '0232 461 00 00', 'critical', 3.40, 68.0, 72.0, 70.0, 52000.00),
  ('a0000000-0000-0000-0000-000000000005', 'SUB-005', 'Çankaya Tesisleri', 'Ankara', 'Turan Güneş Bulvarı No:60', '0312 440 00 00', 'good', 4.70, 94.0, 95.0, 92.0, 71500.00)
ON CONFLICT (code) DO NOTHING;

-- 2. AUDIT TEMPLATES
INSERT INTO audit_templates (id, title, category, total_max_score)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Servis Aracı Denetim Formu', 'servis', 100),
  ('b0000000-0000-0000-0000-000000000002', 'Yemekhane Hijyen ve Standart Denetimi', 'yemekhane', 100),
  ('b0000000-0000-0000-0000-000000000003', 'Tesis ve Saha Temizlik Denetim Formu', 'temizlik', 100)
ON CONFLICT DO NOTHING;

-- 3. AUDIT QUESTIONS - SERVİS ARACI (100 Puan)
INSERT INTO audit_questions (template_id, category_section, question_text, points, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Temizlik', 'Aracın iç ve dış temizliği uygun mu?', 10, 1),
  ('b0000000-0000-0000-0000-000000000001', 'Temizlik', 'Araç içerisinde kötü koku, sigara kokusu veya hijyen sorunu var mı?', 10, 2),
  ('b0000000-0000-0000-0000-000000000001', 'Müşteri Alanı', 'Koltuklar sağlam, temiz ve yolcu kullanımına uygun mu?', 10, 3),
  ('b0000000-0000-0000-0000-000000000001', 'Müşteri Alanı', 'Klima sistemi çalışıyor ve yeterli performans gösteriyor mu?', 10, 4),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Emniyet kemerleri tüm koltuklarda çalışır durumda mı?', 4, 5),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Yangın söndürücü mevcut, dolum tarihi geçerli ve kolay ulaşılabilir mi?', 4, 6),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'İlk yardım çantası eksiksiz ve son kullanma tarihleri uygun mu?', 3, 7),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Acil çıkışlar, acil çıkış çekici ve güvenlik ekipmanları çalışır durumda mı?', 3, 8),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Lastiklerin diş derinliği ve genel durumu uygun mu?', 3, 9),
  ('b0000000-0000-0000-0000-000000000001', 'İş Güvenliği', 'Farlar, sinyaller, stop lambaları ve geri vites lambaları çalışıyor mu?', 3, 10),
  ('b0000000-0000-0000-0000-000000000001', 'Evraklar', 'Sürücü üzerinde kimlik kartı ve gerekli sürücü belgeleri (SRC, Psikoteknik vb.) güncel ve yanında mı?', 20, 11),
  ('b0000000-0000-0000-0000-000000000001', 'Personel', 'Sürücü personellere karşı saygılı ve profesyonel bir iletişim sergiliyor mu?', 20, 12);

-- 4. AUDIT QUESTIONS - YEMEKHANE (100 Puan)
INSERT INTO audit_questions (template_id, category_section, question_text, points, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'El yıkama lavaboları fiziksel özellikleri uygun mu?', 2, 1),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'El yıkama lavaboları ulaşılabilir, kullanıma uygun durumda mı?', 2, 2),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'El yıkama dışında herhangi başka bir amaç için kullanılmıyor mu?', 2, 3),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Üretim boyunca sıcak (ılık) su sağlanıyor mu?', 2, 4),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'El yıkama talimatları mevcut mu?', 2, 5),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Antibakteriyel sabun, el dezenfektanı, tek kullanımlık kağıt havlu temiz ve kullanılabilir durumda mı?', 2, 6),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'El yıkama lavaboları yanında sadece pedallı çöp kovası mevcut mu?', 2, 7),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Tüm personel gıda maddeleri ile temas etmeden önce ellerini yıkıyor mu?', 2, 8),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Gerekli durumlarda talimatlara uygun eldiven kullanılıyor mu?', 2, 9),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Sebze-Meyve Dezenfeksiyonu talimata uygun mu?', 2, 10),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Tüm kritik limitler ile ilgili çalışanlar yeterli bilgiye sahip mi?', 2, 11),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Gıda ürünlerinin tüm hazırlık aşamalarında çapraz kontaminasyona karşı önlem alınmış mı?', 2, 12),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Ortamda üzeri açık gıda maddesi var mı?', 2, 13),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Direkt yere bırakılmış ürün, ekipman vb. var mı?', 2, 14),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Temiz ve kirli bölümler tanımlanmış mı?', 2, 15),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Ürün grup ve risklerine göre renk koduna göre tezgah/bıçak kapasitesi yeterli ve ayrımı yapılmış mı?', 2, 16),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Üretim alanında atık ve yabancı malzeme var mı?', 2, 17),
  ('b0000000-0000-0000-0000-000000000002', 'Hazırlık, Pişirme ve Sevkiyat', 'Üretim alanında cam malzeme ve cam ambalaj var mı?', 2, 18),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Servis personelinin kıyafeti, davranışları hijyen kurallarına uygun mu?', 2, 19),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Servis bölümünün genel temizlik ve düzeni uygun mu?', 2, 20),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Servis ekipmanları temiz mi?', 2, 21),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Servis alanındaki tüm ekipmanlar kullanılabilir durumda mı?', 1, 22),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Alanda alerjen afişleri mevcut mu?', 1, 23),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Yemeklere yakın yerlerde besin etiketleri, alerjen tablosu mevcut mu?', 2, 24),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Yemek salonu tertip ve düzeni talimatlara uygun mu?', 2, 25),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Yemek salonu temiz ve düzenli mi? (masa, sandalye vb.)', 2, 26),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Su sebilleri paslı değil ve temiz mi?', 2, 27),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Saladbar, sos masaları, ekmek dolabı temiz ve düzenli mi?', 2, 28),
  ('b0000000-0000-0000-0000-000000000002', 'Servis Alanı ve Yemek Salonu', 'Cam, yer, kalorifer petekleri, duvar temizliği uygun mu?', 2, 29);

-- 5. SUPPLIERS SEED
INSERT INTO suppliers (name, category, contact_person, phone, email, service_quality_score, punctuality_score, complaint_score, staff_compliance_score, audit_score, action_closure_score, overall_score)
VALUES
  ('ABC Temizlik ve Tesis Hizmetleri', 'Temizlik', 'Ahmet Demir', '0532 111 22 33', 'operasyon@abctemizlik.com', 90.0, 85.0, 82.0, 95.0, 86.0, 84.0, 87.0),
  ('Lider Turizm Servis Taşımacılık', 'Servis', 'Mustafa Kara', '0542 333 44 55', 'filo@liderturizm.com', 92.0, 94.0, 88.0, 96.0, 91.0, 90.0, 91.8),
  ('Gourmet Catering & Yemek San.', 'Yemekhane', 'Ayşe Güler', '0555 666 77 88', 'kalite@gourmetcatering.com', 88.0, 90.0, 85.0, 92.0, 89.0, 86.0, 88.3),
  ('Kale Güvenlik ve Koruma Hiz.', 'Güvenlik', 'Selim Yıldız', '0533 888 99 00', 'guvenlik@kaleguvenlik.com', 95.0, 96.0, 92.0, 98.0, 94.0, 95.0, 95.0)
ON CONFLICT DO NOTHING;

-- 6. ANNOUNCEMENTS SEED (Görseldekiler)
INSERT INTO announcements (title, content, date)
VALUES
  ('Bayram Tatili Duyurusu', 'Kurban Bayramı tatili 6-9 Haziran tarihleri arasındadır. Nöbetçi idari kadro bilgilendirilmiştir.', '2026-05-30'),
  ('Yemekhane Çalışma Saatleri', '1 Haziran itibarıyla yemekhane saatlerinde değişiklik olacaktır. Öğle servisi 12:00-14:00 saatleri arasına çekilmiştir.', '2026-05-28'),
  ('Servis Güzergah Güncellemesi', 'Bazı servis güzergahlarında güncelleme yapılmıştır. Yeni güzergah detayları Servis modülüne yüklenmiştir.', '2026-05-27')
ON CONFLICT DO NOTHING;

-- 7. VEHICLES SEED
INSERT INTO vehicles (plate, vehicle_type, brand, model, model_year, driver_name, driver_phone, capacity, passenger_count, route_name, current_lat, current_lng, current_speed, interior_temp, ac_status, cleanliness_score)
VALUES
  ('34 ABC 123', 'servis', 'Mercedes-Benz', 'Sprinter 16+1', 2024, 'Ali Öztürk', '0532 999 11 22', 16, 14, 'Kadıköy - Maslak Ekspres', 41.0125, 28.9800, 48.5, 22.4, TRUE, 94.0),
  ('34 XYZ 789', 'servis', 'Volkswagen', 'Crafter 19+1', 2023, 'Kemal Aydın', '0533 777 44 11', 19, 18, 'Beylikdüzü - Maslak Ring', 40.9980, 28.9100, 52.0, 23.1, TRUE, 91.0),
  ('35 IZM 360', 'servis', 'Ford', 'Transit 16+1', 2025, 'Hüseyin Kaya', '0544 555 22 33', 16, 15, 'Bornova - Agora Ring', 38.4192, 27.1287, 42.0, 21.8, TRUE, 96.0),
  ('06 ANK 360', 'filo', 'Renault', 'Megane Sedan', 2024, 'İdari Hizmet Aracı', '0312 440 00 00', 5, 2, 'Çankaya Saha Kontrol', 39.9208, 32.8541, 35.0, 22.0, TRUE, 98.0)
ON CONFLICT (plate) DO NOTHING;
