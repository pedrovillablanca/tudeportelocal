import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "TuDeporteLocal - Directorio Deportivo de Chile",
  description: "Encuentra clubes deportivos cerca de ti. Fútbol, Básquetbol, Natación y más.",
  icons: {
    icon: [
      { url: "/images/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/images/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/images/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png", rel: "icon" },
      { url: "/images/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png", rel: "icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
