import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Bundle core React library separately for browser caching
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "vendor-react";
            }
            // Dynamic anim library
            if (id.includes("framer-motion")) {
              return "vendor-animations";
            }
            // Bundle heavy SVG icons separately
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // Bundle charting & visual metrics engine
            if (id.includes("recharts") || id.includes("d3")) {
              return "vendor-charts";
            }
            // Supabase backend API integration code
            if (id.includes("@supabase") || id.includes("supabase")) {
              return "vendor-supabase";
            }
            return "vendor"; // all other node_modules combined
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200,
  }
}));
