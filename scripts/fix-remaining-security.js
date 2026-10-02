const https = require("https");
const fs = require("fs");

const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) env[k.trim()] = v.join("=").trim();
});

const PAT = env.SUPABASE_PAT;
const PROJECT_REF = env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "").split(".")[0];

function runSQL(sql) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ query: sql });
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${PROJECT_REF}/database/query`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${PAT}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, body: data }); }
        });
      }
    );
    req.on("error", (e) => resolve({ status: 500, body: e.message }));
    req.write(postData);
    req.end();
  });
}

const fixSQL = `
-- 1. PUBLIC Rolünden yetkileri al (Anon erişimini kökünden keser)
REVOKE EXECUTE ON FUNCTION public.is_approved_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_approved_user() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_user_facility() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_facility() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user_registration() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user_registration() TO service_role;

-- 2. Gevşek ve çakışan (duplicate) politikaları temizle
DROP POLICY IF EXISTS "announcements_select" ON announcements;
DROP POLICY IF EXISTS "audit_questions_select" ON audit_questions;
DROP POLICY IF EXISTS "audit_templates_select" ON audit_templates;
DROP POLICY IF EXISTS "facilities_select" ON facilities;
DROP POLICY IF EXISTS "operations_select" ON operations;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "suppliers_select" ON suppliers;
DROP POLICY IF EXISTS "vehicles_select" ON vehicles;

-- 3. Eksik politikayı ekle (vehicle_telemetry)
DROP POLICY IF EXISTS "vehicle_telemetry_select" ON vehicle_telemetry;
CREATE POLICY "vehicle_telemetry_select" ON vehicle_telemetry FOR SELECT TO authenticated USING (public.is_approved_user());

DROP POLICY IF EXISTS "vehicle_telemetry_insert" ON vehicle_telemetry;
CREATE POLICY "vehicle_telemetry_insert" ON vehicle_telemetry FOR INSERT TO authenticated WITH CHECK (public.is_approved_user());
`;

async function main() {
  console.log("Kalan son güvenlik açıkları kapatılıyor...");
  const res = await runSQL(fixSQL);
  if (res.status === 200 || res.status === 201) {
    console.log("✅ Tüm yamalar başarıyla uygulandı!");
  } else {
    console.log("❌ Hata:", res.status, res.body);
  }
}

main();
