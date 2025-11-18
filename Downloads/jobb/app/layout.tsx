import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { UnifiedHeader } from "@/components/unified-header"
import { AuthProvider } from "@/lib/auth-context"
import "./globals.css"

const cairo = Cairo({ subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "باب رزق - منصة التوظيف الأولى في مصر",
  description: "ابحث عن فرصتك الوظيفية المثالية أو جد أفضل المواهب على باب رزق، منصة التوظيف الحديثة في مصر",
  keywords: ["وظائف", "توظيف", "فرص عمل", "مصر", "البحث عن عمل"],
  authors: [{ name: "باب رزق" }],
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE", // استبدل بـ verification code من Google Search Console
  },
  openGraph: {
    title: "باب رزق - منصة التوظيف الأولى في مصر",
    description: "ابحث عن فرصتك الوظيفية أو جد أفضل المواهب",
    type: "website",
    url: "https://babreizk.com",
    siteName: "باب رزق",
  },
  twitter: {
    card: "summary_large_image",
    title: "باب رزق - منصة التوظيف الأولى في مصر",
    description: "ابحث عن فرصتك الوظيفية أو جد أفضل المواهب",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="canonical" href="https://babreizk.com" />
        <link rel="sitemap" href="/sitemap.xml" />
      </head>
      <body className={`${cairo.className} font-sans antialiased`}>
        <AuthProvider>
          <UnifiedHeader />
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  )
}
