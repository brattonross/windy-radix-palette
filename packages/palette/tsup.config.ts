import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	clean: true,
	dts: true,
	external: ["@radix-ui/colors", "tailwindcss"],
	format: ["cjs", "esm"],
});
