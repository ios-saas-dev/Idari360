# İdari 360 — İdari İşler Yönetim Süreç Platformu

**İdari 360**, A’dan Z’ye tam kapsamlı bir İdari İşler tesis yönetimi, araç takibi, denetim, raporlama ve operasyon süreçlerini barındıran, kurumsal çok kullanıcılı web tabanlı yönetim platformudur.

---

## 🚀 Teknoloji Yığını (Tech Stack)

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Tasarım & UI:** Tailwind CSS, shadcn/ui, Recharts, Lucide Icons (Referans tasarımla piksel hassasiyetinde eşleşecek şekilde)
- **Veritabanı & Arka Uç:** Supabase (PostgreSQL, PostGIS, Supabase Realtime, Row Level Security)
- **Kimlik Doğrulama:** Supabase Auth + Next.js Edge Middleware
- **Otomatik E-posta & Raporlama:** Resend + React Email (Vercel Cron Jobs ile otomatik tetiklenir)
- **Harita & Araç Takip:** Mapbox GL JS (react-map-gl) + Supabase Realtime & PostGIS (Canlı GPS & Telemetri & Kabin Sıcaklığı)
- **Push Bildirimleri:** Firebase Cloud Messaging (FCM) (Web push ve gelecekteki iOS/Android mobil uygulama için merkezi bildirim motoru)
- **Raporlama Çıktıları:** jsPDF + autoTable ile anında resmi denetim ve yönetici PDF çıktısı

---

## 🔒 Rol ve Yetki Mimarisi (Kritik Güvenlik Gereksinimleri)

Sistemde veritabanı düzeyinde **Row Level Security (RLS)** ve uygulama katmanında **Next.js Middleware (`middleware.ts`)** ile 4 kesin rol ayrılmıştır:

| Rol | Rol Kodu | Web Paneli Erişimi | Kapsam & Yetki | Otomatik Raporlama |
| :--- | :--- | :--- | :--- | :--- |
| **İdari İşler Yöneticisi** | `facility_admin` | ✅ Tam Erişim | Tüm 47 tesise ait verilere limitsiz okuma/yazma, tam konsolide dashboard | Tüm tesisleri kapsayan günlük ve periyodik raporlar |
| **İdari İşler Uzmanı** | `facility_specialist` | ✅ Tesis Erişimi | Yalnızca bağlı bulunduğu tesisin (`facility_id`) verilerine erişim ve işlem yapma | Yalnızca kendi tesisinin otomatik operasyon raporları |
| **İdari İşler Sorumlusu** | `facility_supervisor` | ✅ Tesis Erişimi | Yalnızca kendi tesisinin verilerine erişim ve işlem yapma | **HİÇBİR SİSTEM RAPORU GÖNDERİLMEZ** |
| **Personel** | `staff` | ❌ **KESİNLİKLE YASAK** | Web'e girmeye çalıştığında anında `/yetkisiz-erisim` sayfasına yönlendirilir ve oturumu sonlandırılır | Yalnızca mobil uygulama (kapsam dışı) |

---

## 🗺️ Fazlar ve Yol Haritası

- **Faz 1:** Uygulama Arayüzü & İskeleti (Referans görseldeki Sidebar, Header, Stat Kartları, Donut Chart, Trend Grafiği, Hızlı İşlemler, Duyurular, Kategori Çubukları, Memnuniyet Skoru ve Kategori Grid)
- **Faz 2:** Ana Modüller (Yemekhane, Servis, Filo, Varlık/Demirbaş & QR Kod, Şubeler 360° Karnesi)
- **Faz 3:** Talep & Onay Sistemi (`Yeni` → `Sorumlu Kişi` → `Onayda` → `İşlem` → `Tamamlandı`)
- **Faz 4:** Denetim & Kontrol Merkezi:
  - Servis Aracı Denetimi (12 soru, 100 puan)
  - Yemekhane Hijyen & HACCP Denetimi (34 soru, 100 puan)
  - Saha & Tesis Temizlik Denetimi (18 soru, 100 puan)
  - *Özel Kural:* Her soruda **Evet / Hayır**; **Hayır** seçildiğinde zorunlu **Açıklama**, **Termin (Deadline)** ve **Fotoğraf** yükleme alanı açılır.
- **Faz 5:** Tedarikçi & Firma Performansı (Hizmet Kalitesi, Zamanında Hizmet, Şikayet, Personel, Denetim, Aksiyon Kapatma - 6 kriterli karne)
- **Faz 6:** Raporlama & Yönetici Dashboard (47 Şube: 38 İyi, 7 Takip, 2 Kritik, Açık Aksiyonlar, PDF dışa aktarma)
- **Faz 7:** Otomasyon & Bildirimler (7 gün, 3 gün, 1 gün kala e-posta & FCM push bildirimleri)
- **Faz 8:** Akıllı İdari 360 (Tüketim anomali tespitleri, araç klima arıza tahminleri)

---

## 🛠️ Kurulum ve Çalıştırma

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env.local` dosyasını yapılandırın:
   ```bash
   cp .env.example .env.local
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 📦 Dağıtım (GitHub & Vercel)

### 1. GitHub Reposuna Gönderme:
```bash
git init
git add .
git commit -m "feat: idari360 complete platform v1.0"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/idari360.git
git push -u origin main
```

### 2. Vercel'e Push Etme:
1. [Vercel Dashboard](https://vercel.com) üzerinden **Add New Project** seçin ve GitHub reposunu bağlayın.
2. Ortam Değişkenlerini (Environment Variables) girin (`NEXT_PUBLIC_SUPABASE_URL`, `RESEND_API_KEY` vb.).
3. `vercel.json` içerisindeki Cron Jobs (`/api/cron/daily-report` ve `/api/cron/audit-reminders`) Vercel tarafından otomatik devreye alınacaktır.
