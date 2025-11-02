import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { PWARegister } from "@/components/pwa-register"
import PushClient from "@/components/push-client"
import AnimatedBackground from "@/components/animated-background"

const playfairDisplay = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"] })
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

export const metadata: Metadata = {
  title: "Dinner N' Awards Night – The Great Banquet",
  description: "Join us for an elegant evening celebrating teen achievements at the provincial awards ceremony",
  generator: "v0.app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  openGraph: {
    title: "Dinner N' Awards Night — The Great Banquet",
    description:
      "Join us for an elegant evening celebrating achievements at the provincial awards ceremony. Get your ticket now!",
    url: "/",
    siteName: "Dinner N’ Awards Night",
    images: [
      {
        url: "/awards-ceremony-stage-with-purple-lighting.jpg",
        width: 1200,
        height: 630,
        alt: "Dinner N’ Awards Night banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dinner N' Awards Night — The Great Banquet",
    description:
      "Join us for an elegant evening celebrating achievements at the provincial awards ceremony. Get your ticket now!",
    images: ["/awards-ceremony-stage-with-purple-lighting.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6B3FA0" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <PWARegister />
        <PushClient />
        <AnimatedBackground />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
