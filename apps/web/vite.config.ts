import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Copy index.html to 404.html for SPA fallback (Cloudflare Pages, etc.) */
function copyIndexTo404() {
	return {
		name: "copy-index-to-404",
		closeBundle() {
			const outDir = path.resolve(__dirname, "dist");
			const indexPath = path.join(outDir, "index.html");
			const notFoundPath = path.join(outDir, "404.html");
			if (fs.existsSync(indexPath)) {
				fs.copyFileSync(indexPath, notFoundPath);
				console.log("✓ Copied index.html to 404.html for SPA fallback");
			}
		},
	};
}

/** Must match apps/web/wrangler.toml [env.*.vars] — overrides .env / .env.local for these builds */
const UTOS_STAGING_SERVER =
	"https://utos-and-co-server-staging.utosandco.workers.dev";
const UTOS_STAGING_CLIENT = "https://utos-and-co-staging.utosandco.workers.dev";
const UTOS_PROD_SERVER = "https://api.utosandco.com";
const UTOS_PROD_CLIENT = "https://utosandco.com";

export default defineConfig(({ mode }) => {
	// Determine the Cloudflare environment based on Vite mode
	const cfEnvironment =
		mode === "production"
			? "production"
			: mode === "staging"
				? "staging"
				: mode === "dev"
					? "dev"
					: undefined;

	const utosApiUrls =
		mode === "staging" || mode === "dev"
			? {
					"import.meta.env.VITE_SERVER_URL":
						JSON.stringify(UTOS_STAGING_SERVER),
					"import.meta.env.VITE_CLIENT_URL":
						JSON.stringify(UTOS_STAGING_CLIENT),
				}
			: mode === "production"
				? {
						"import.meta.env.VITE_SERVER_URL": JSON.stringify(UTOS_PROD_SERVER),
						"import.meta.env.VITE_CLIENT_URL": JSON.stringify(UTOS_PROD_CLIENT),
					}
				: {};

	return {
		define: utosApiUrls,
		plugins: [
			tailwindcss(),
			copyIndexTo404(),
			tanstackRouter({
				// Output to .tanstack/ to avoid EPERM/file-lock issues on Windows when
				// the generator renames temp -> src/routeTree.gen.ts (IDE/Vite lock the file)
				generatedRouteTree: path.resolve(
					__dirname,
					".tanstack/routeTree.gen.ts",
				),
				tmpDir: path.resolve(__dirname, ".tanstack/tmp"),
				autoCodeSplitting: true,
			}),
			react(),
			cloudflare({
				configPath: cfEnvironment ? undefined : "wrangler.toml",
				environment: cfEnvironment,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
