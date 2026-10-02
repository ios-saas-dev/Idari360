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
const RESEND_KEY = env.RESEND_API_KEY;
const RESEND_FROM = env.RESEND_FROM_EMAIL || "info@idari360.com"; // Fallback if missing

const confirmationContent = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h2 style="color: #2563eb;">İdari 360'a Hoş Geldiniz!</h2>
  <p>Güvenliğiniz için lütfen e-posta adresinizi doğrulayarak hesabınızı aktifleştirin.</p>
  <div style="margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">E-posta Adresimi Doğrula</a>
  </div>
  <p style="font-size: 0.9em; color: #666;">Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı güvenle silebilirsiniz.</p>
  <br/>
  <p>Saygılarımızla,<br/><b>İdari 360 Sistemi</b></p>
</div>`;

const recoveryContent = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h2 style="color: #2563eb;">Şifre Sıfırlama Talebi</h2>
  <p>İdari 360 hesabınız için bir şifre sıfırlama talebi aldık. Şifrenizi yenilemek için aşağıdaki bağlantıya tıklayabilirsiniz.</p>
  <div style="margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Şifremi Sıfırla</a>
  </div>
  <p style="font-size: 0.9em; color: #666;">Eğer böyle bir talepte bulunmadıysanız, lütfen bu e-postayı dikkate almayın. Hesabınız güvendedir.</p>
  <br/>
  <p>Saygılarımızla,<br/><b>İdari 360 Sistemi</b></p>
</div>`;

const payload = JSON.stringify({
  // Enable custom SMTP with Resend
  smtp_host: "smtp.resend.com",
  smtp_port: "465",
  smtp_user: "resend",
  smtp_pass: RESEND_KEY,
  smtp_sender_name: "İdari 360",
  smtp_admin_email: RESEND_FROM,
  
  // Custom templates
  mailer_subjects_confirmation: "İdari 360 - E-posta Adresinizi Doğrulayın",
  mailer_templates_confirmation_content: confirmationContent,
  mailer_subjects_recovery: "İdari 360 - Şifre Sıfırlama Talebi",
  mailer_templates_recovery_content: recoveryContent,
});

const req = https.request(
  {
    hostname: "api.supabase.com",
    path: `/v1/projects/${PROJECT_REF}/config/auth`,
    method: "PATCH",
    headers: { 
      "Authorization": `Bearer ${PAT}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload)
    },
  },
  (res) => {
    let data = "";
    res.on("data", (c) => (data += c));
    res.on("end", () => {
      console.log(`Status: ${res.statusCode}`);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("Ayarlar ve SMTP başarıyla güncellendi.");
      } else {
        console.log("Hata:", data);
      }
    });
  }
);
req.on("error", console.error);
req.write(payload);
req.end();
