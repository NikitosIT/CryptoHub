import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    env: {
      VITE_SUPABASE_URL: "http://localhost",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
      VITE_SUPABASE_FUNCTIONS_URL: "http://localhost",
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
