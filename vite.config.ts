import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    // Cache Busting: Gerar hashes únicos para todos os assets
    rollupOptions: {
      output: {
        // Gerar nomes únicos para chunks JS
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Gerar nomes únicos para assets (CSS, imagens, etc.)
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          
          // Organizar por tipo de arquivo
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `assets/css/[name]-[hash].${extType}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          
          return `assets/[name]-[hash].${extType}`;
        },
        // Entry points com hash
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Limpar diretório de saída antes de cada build
    emptyOutDir: true,
    // Garantir que o manifest.json seja gerado com informações de hash
    manifest: true,
  },
});