import type { NextConfig } from "next";

const isTauriExport = process.env.TAURI_EXPORT === 'true';

const nextConfig: NextConfig = {
  // Para Tauri: exportación estática
  output: isTauriExport ? 'export' : undefined,
  
  images: {
    unoptimized: isTauriExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hwckkfiirldgundbcjsp.supabase.co",
      },
    ],
  },
  
  // Configuración para Tauri
  ...(isTauriExport && {
    trailingSlash: true,
    distDir: 'out',
  }),
};

export default nextConfig;
