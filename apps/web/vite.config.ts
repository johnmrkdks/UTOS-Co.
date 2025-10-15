import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  // Determine the Cloudflare environment based on Vite mode
  const cfEnvironment = mode === 'production' ? 'production' : mode === 'staging' ? 'staging' : undefined;

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({}),
      react(),
      cloudflare({
        configPath: cfEnvironment ? undefined : 'wrangler.toml',
        environment: cfEnvironment,
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});