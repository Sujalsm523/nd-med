import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
   base: "/", 
  // ✅ ensures proper routing fallback in dev + preview
  server: {
    historyApiFallback: true,
  },

  preview: {
    port: 4173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
  },
});
