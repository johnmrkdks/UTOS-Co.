import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts", "src/templates/index.ts"],
	format: ["cjs", "esm"],
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["nodemailer", "googleapis", "react", "@react-email/components", "@react-email/render"],
	esbuildOptions: (options) => {
		options.jsx = "automatic";
		options.jsxImportSource = "react";
	},
});