import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LifeOS",
    short_name: "LifeOS",
    description: "Tu sistema operativo personal. Gestiona hábitos, finanzas, gimnasio y más.",
    start_url: "/home",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    orientation: "portrait",
    categories: ["productivity", "health", "finance", "lifestyle"],
  }
}
