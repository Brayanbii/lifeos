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
      <body className="min-h-screen bg-background antialiased selection:bg-primary/30 relative">
        <ThemeProvider>
          {/* Aurora Background */}
          <div className="fixed inset-0 -z-10 h-full w-full bg-white/50 dark:bg-[#050505]">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-900/30 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob"></div>
             <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000"></div>
             <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-400/20 dark:bg-emerald-900/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000"></div>
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
