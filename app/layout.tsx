import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Park Noktam — Güvenli ve Hızlı Park Yeri Çözümü",
  description:
    "İşletmelere, sitelere ve bireylere ait atıl park alanlarını dijital platformda buluşturuyoruz. Konum ve saate göre rezervasyon yap, güvenle park et.",
  keywords: "otopark, park yeri, park rezervasyon, paylaşımlı otopark, Istanbul park",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fdfdfd",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: "#162340",
                color: "#F1F5F9",
                border: "1px solid rgba(148,163,184,0.15)",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                maxWidth: "420px",
              },
              success: {
                iconTheme: { primary: "#22C55E", secondary: "#162340" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#162340" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
