import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	base: "/quiz-builder/",
	plugins: [react()],
	base: "/quiz-builder/",
	server: {
		port: 5173,
	},
});
