import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "İdari 360 — İdari İşler Yönetim Süreç Platformu",
  description: "A'dan Z'ye tam kapsamlı İdari İşler tesis yönetimi, araç takibi, denetim, raporlama ve operasyon süreçleri paneli.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
