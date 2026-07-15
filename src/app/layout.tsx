import type { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Tu sistema operativo personal. Gestiona hábitos, finanzas, gimnasio y más.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LifeOS",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
