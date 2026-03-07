import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  // Determine the Cloudflare environment based on Vite mode
  const cfEnvironment = mode === 'production' ? 'production' : mode === 'staging' ? 'staging' : mode === 'dev' ? 'dev' : undefined;

  return {
    plugins: [
      tailwindcss(),
      tanstackRouter({
        // Output to .tanstack/ to avoid EPERM/file-lock issues on Windows when
        // the generator renames temp -> src/routeTree.gen.ts (IDE/Vite lock the file)
        generatedRouteTree: path.resolve(__dirname, ".tanstack/routeTree.gen.ts"),
        tmpDir: path.resolve(__dirname, ".tanstack/tmp"),
      }),
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