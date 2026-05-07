import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "BlindAI — Compliance RGPD/LGPD + segurança em 1 linha de código",
    template: "%s · BlindAI",
  },
  description:
    "Plataforma defensiva multi-tenant: cookie banner RGPD, security scanner, anti-phishing, alerts. Para sites em qualquer stack.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    title: "BlindAI",
    description: "Compliance RGPD/LGPD + segurança em 1 linha de código",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#00FF41",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={mono.variable}>
      <body className="bg-ink-900 text-matrix-100 min-h-screen">{children}</body>
    </html>
  );
}
